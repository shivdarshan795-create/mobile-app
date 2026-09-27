import type { SQLiteDatabase } from 'expo-sqlite';

import { listUnlockedAchievements, unlockAchievement } from '@/db/achievements';
import { countCompletedEntries, getEntriesForHabit, getEntriesForUserRange, upsertEntry } from '@/db/entries';
import { addRewardTransaction, hasRewardForDate } from '@/db/rewards';
import type { Habit } from '@/db/types';
import { ACHIEVEMENTS, type AchievementContext, type AchievementDef } from './achievements-catalog';
import { addDays, dateKey, parseDateKey, startOfWeekKey, todayKey } from './date';
import { isHabitScheduledOn } from './habit-schedule';
import { POINTS, isStreakBonusDay } from './rewards-engine';
import { currentStreak } from './streaks';

export type CompletionResult = {
  points: number;
  streak: number;
  isPerfectDay: boolean;
  newlyUnlocked: AchievementDef[];
};

/**
 * Single entry point for "the user just changed today's value for a habit". Persists the entry,
 * then awards every reward that applies (completion, streak bonus, perfect day, weekly goal,
 * milestones) exactly once per day/week via hasRewardForDate / unlockAchievement's own uniqueness.
 */
export async function recordHabitProgress(
  db: SQLiteDatabase,
  params: { userId: string; habit: Habit; allActiveHabits: Habit[]; value: number }
): Promise<CompletionResult> {
  const { userId, habit, allActiveHabits, value } = params;
  const today = todayKey();

  const beforeEntries = await getEntriesForHabit(db, habit.id, today, today);
  const wasCompleted = beforeEntries[0]?.completed === 1;

  await upsertEntry(db, { habitId: habit.id, date: today, value, targetValue: habit.targetValue });
  const nowCompleted = value >= habit.targetValue && value > 0;
  const justCompleted = nowCompleted && !wasCompleted;

  let points = 0;

  if (justCompleted) {
    await addRewardTransaction(db, {
      userId,
      type: 'completion',
      points: POINTS.completion,
      habitId: habit.id,
      date: today,
    });
    points += POINTS.completion;
  }

  const habitEntries = await getEntriesForHabit(db, habit.id, habit.startDate, today);
  const entryMap = new Map(habitEntries.map((e) => [e.date, e]));
  const streak = currentStreak({
    isCompleted: (key) => entryMap.get(key)?.completed === 1,
    isScheduled: (key) => isHabitScheduledOn(habit, key),
    minDateKey: habit.startDate,
  });

  if (justCompleted && isStreakBonusDay(streak)) {
    const already = await hasRewardForDate(db, { userId, type: 'streak_bonus', date: today, habitId: habit.id });
    if (!already) {
      await addRewardTransaction(db, {
        userId,
        type: 'streak_bonus',
        points: POINTS.streakBonus,
        habitId: habit.id,
        date: today,
      });
      points += POINTS.streakBonus;
    }
  }

  const scheduledToday = allActiveHabits.filter((h) => isHabitScheduledOn(h, today));
  const rangeEntries = await getEntriesForUserRange(db, userId, today, today);
  const completedIdsToday = new Set(rangeEntries.filter((e) => e.completed === 1).map((e) => e.habitId));
  if (nowCompleted) completedIdsToday.add(habit.id);
  const isPerfectDay = scheduledToday.length > 0 && scheduledToday.every((h) => completedIdsToday.has(h.id));

  if (isPerfectDay) {
    const already = await hasRewardForDate(db, { userId, type: 'perfect_day', date: today });
    if (!already) {
      await addRewardTransaction(db, { userId, type: 'perfect_day', points: POINTS.perfectDay, date: today });
      points += POINTS.perfectDay;
    }
  }

  if (habit.frequency === 'timesPerWeek' && habit.timesPerWeek && justCompleted) {
    const weekStart = startOfWeekKey(today);
    const weekCount = habitEntries.filter((e) => e.date >= weekStart && e.date <= today && e.completed === 1).length;
    if (weekCount >= habit.timesPerWeek) {
      const already = await hasRewardForDate(db, {
        userId,
        type: 'weekly_goal',
        date: weekStart,
        habitId: habit.id,
      });
      if (!already) {
        await addRewardTransaction(db, {
          userId,
          type: 'weekly_goal',
          points: POINTS.weeklyGoal,
          habitId: habit.id,
          date: weekStart,
        });
        points += POINTS.weeklyGoal;
      }
    }
  }

  const newlyUnlocked: AchievementDef[] = [];
  if (justCompleted) {
    const ctx = await computeAchievementContext(db, userId, allActiveHabits);
    const unlocked = await listUnlockedAchievements(db, userId);
    const unlockedIds = new Set(unlocked.map((a) => a.achievementType));
    for (const def of ACHIEVEMENTS) {
      if (unlockedIds.has(def.id) || !def.isUnlocked(ctx)) continue;
      const didUnlock = await unlockAchievement(db, userId, def.id);
      if (didUnlock) {
        await addRewardTransaction(db, { userId, type: 'milestone', points: POINTS.milestone, source: def.id, date: today });
        points += POINTS.milestone;
        newlyUnlocked.push(def);
      }
    }
  }

  return { points, streak, isPerfectDay, newlyUnlocked };
}

export async function computeAchievementContext(
  db: SQLiteDatabase,
  userId: string,
  activeHabits: Habit[]
): Promise<AchievementContext> {
  const totalCompletions = await countCompletedEntries(db, userId);

  if (activeHabits.length === 0) {
    return { totalCompletions, bestStreakAcrossHabits: 0, perfectDayStreak: 0, morningStreak: 0, totalPerfectDays: 0 };
  }

  let bestStreakAcrossHabits = 0;
  for (const habit of activeHabits) {
    const entries = await getEntriesForHabit(db, habit.id, habit.startDate, todayKey());
    const entryMap = new Map(entries.map((e) => [e.date, e]));
    const streak = currentStreak({
      isCompleted: (key) => entryMap.get(key)?.completed === 1,
      isScheduled: (key) => isHabitScheduledOn(habit, key),
      minDateKey: habit.startDate,
    });
    bestStreakAcrossHabits = Math.max(bestStreakAcrossHabits, streak);
  }

  const earliestStart = activeHabits.reduce((min, h) => (h.startDate < min ? h.startDate : min), todayKey());
  const rangeEntries = await getEntriesForUserRange(db, userId, earliestStart, todayKey());
  const completedHabitIdsByDate = new Map<string, Set<string>>();
  for (const entry of rangeEntries) {
    if (entry.completed !== 1) continue;
    if (!completedHabitIdsByDate.has(entry.date)) completedHabitIdsByDate.set(entry.date, new Set());
    completedHabitIdsByDate.get(entry.date)!.add(entry.habitId);
  }

  function isDayFullyDone(key: string, habitsToCheck: Habit[]) {
    const scheduled = habitsToCheck.filter((h) => isHabitScheduledOn(h, key));
    if (scheduled.length === 0) return false;
    const done = completedHabitIdsByDate.get(key) ?? new Set<string>();
    return scheduled.every((h) => done.has(h.id));
  }

  function countBackwardStreak(habitsToCheck: Habit[]) {
    let streak = 0;
    let cursor = new Date();
    while (dateKey(cursor) >= earliestStart) {
      const key = dateKey(cursor);
      if (!isDayFullyDone(key, habitsToCheck)) break;
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  const perfectDayStreak = countBackwardStreak(activeHabits);
  const morningHabits = activeHabits.filter((h) => h.timeOfDay === 'morning');
  const morningStreak = morningHabits.length > 0 ? countBackwardStreak(morningHabits) : 0;

  let totalPerfectDays = 0;
  let scanCursor = parseDateKey(earliestStart);
  while (dateKey(scanCursor) <= todayKey()) {
    if (isDayFullyDone(dateKey(scanCursor), activeHabits)) totalPerfectDays += 1;
    scanCursor = addDays(scanCursor, 1);
  }

  return { totalCompletions, bestStreakAcrossHabits, perfectDayStreak, morningStreak, totalPerfectDays };
}
