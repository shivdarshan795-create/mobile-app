import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import type { BarDatum } from '@/components/ui/bar-chart';
import type { HeatmapDatum } from '@/components/ui/heatmap';
import type { LinePoint } from '@/components/ui/line-chart';
import { getEntriesForUserRange } from '@/db/entries';
import { useDb } from '@/db/provider';
import type { Habit, HabitCategory, HabitEntryRow } from '@/db/types';
import { addDays, dateKey, lastNDateKeys, parseDateKey, todayKey, weekdayShort } from '@/lib/date';
import { isHabitScheduledOn } from '@/lib/habit-schedule';
import { bestStreak, completionRate, currentStreak } from '@/lib/streaks';
import { useHabits } from './use-habits';

// Windowed to keep queries and in-memory math small; ample for a personal habit tracker.
const HISTORY_DAYS = 90;
const HEATMAP_WEEKS = 12;
const TREND_WEEKS = 8;

export type HabitPerformance = {
  habit: Habit;
  rate: number;
};

export type CategoryBreakdown = {
  category: HabitCategory;
  rate: number;
};

export function useInsights() {
  const db = useDb();
  const { user } = useAuth();
  const { habits, isLoaded: habitsLoaded } = useHabits(['active']);
  const [entries, setEntries] = useState<HabitEntryRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoaded(true);
      return;
    }
    const start = dateKey(addDays(new Date(), -(HISTORY_DAYS - 1)));
    const rows = await getEntriesForUserRange(db, user.id, start, todayKey());
    setEntries(rows);
    setIsLoaded(true);
  }, [db, user]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const entriesByHabit = useMemo(() => {
    const map = new Map<string, Map<string, HabitEntryRow>>();
    for (const entry of entries) {
      if (!map.has(entry.habitId)) map.set(entry.habitId, new Map());
      map.get(entry.habitId)!.set(entry.date, entry);
    }
    return map;
  }, [entries]);

  const isCompletedOn = useCallback(
    (habitId: string, key: string) => entriesByHabit.get(habitId)?.get(key)?.completed === 1,
    [entriesByHabit]
  );

  const aggregateRate = useCallback(
    (startKey: string, endKey: string, subset: Habit[] = habits) => {
      let scheduled = 0;
      let completed = 0;
      let cursor = parseDateKey(startKey);
      while (dateKey(cursor) <= endKey) {
        const key = dateKey(cursor);
        for (const habit of subset) {
          if (isHabitScheduledOn(habit, key)) {
            scheduled += 1;
            if (isCompletedOn(habit.id, key)) completed += 1;
          }
        }
        cursor = addDays(cursor, 1);
      }
      return scheduled === 0 ? 0 : completed / scheduled;
    },
    [habits, isCompletedOn]
  );

  const today = todayKey();

  const consistencyScore = useMemo(() => aggregateRate(dateKey(addDays(new Date(), -6)), today), [aggregateRate, today]);
  const previousWeekScore = useMemo(
    () => aggregateRate(dateKey(addDays(new Date(), -13)), dateKey(addDays(new Date(), -7))),
    [aggregateRate]
  );
  const consistencyDelta = consistencyScore - previousWeekScore;

  const completionRateLast30 = useMemo(
    () => aggregateRate(dateKey(addDays(new Date(), -29)), today),
    [aggregateRate, today]
  );

  const weeklyCompletion: BarDatum[] = useMemo(() => {
    return lastNDateKeys(7).map((key) => {
      const scheduled = habits.filter((h) => isHabitScheduledOn(h, key));
      const done = scheduled.filter((h) => isCompletedOn(h.id, key)).length;
      return { label: weekdayShort(parseDateKey(key)), value: scheduled.length === 0 ? 0 : done / scheduled.length };
    });
  }, [habits, isCompletedOn]);

  const consistencyTrend: LinePoint[] = useMemo(() => {
    const points: LinePoint[] = [];
    for (let w = TREND_WEEKS - 1; w >= 0; w -= 1) {
      const end = addDays(new Date(), -7 * w);
      const start = addDays(end, -6);
      points.push({ label: `${TREND_WEEKS - w}`, value: aggregateRate(dateKey(start), dateKey(end)) });
    }
    return points;
  }, [aggregateRate]);

  const heatmap: HeatmapDatum[] = useMemo(() => {
    return lastNDateKeys(HEATMAP_WEEKS * 7).map((key) => {
      const scheduled = habits.filter((h) => isHabitScheduledOn(h, key));
      const done = scheduled.filter((h) => isCompletedOn(h.id, key)).length;
      return { date: key, intensity: scheduled.length === 0 ? 0 : done / scheduled.length };
    });
  }, [habits, isCompletedOn]);

  const streaks = useMemo(() => {
    let current = 0;
    let best = 0;
    for (const habit of habits) {
      const habitEntries = entriesByHabit.get(habit.id) ?? new Map<string, HabitEntryRow>();
      const isCompleted = (key: string) => habitEntries.get(key)?.completed === 1;
      const isScheduled = (key: string) => isHabitScheduledOn(habit, key);
      const minDateKey = habit.startDate < dateKey(addDays(new Date(), -(HISTORY_DAYS - 1)))
        ? dateKey(addDays(new Date(), -(HISTORY_DAYS - 1)))
        : habit.startDate;
      current = Math.max(current, currentStreak({ isCompleted, isScheduled, minDateKey }));
      best = Math.max(best, bestStreak({ isCompleted, isScheduled, minDateKey }));
    }
    return { current, best };
  }, [habits, entriesByHabit]);

  const habitPerformance: HabitPerformance[] = useMemo(() => {
    const start = dateKey(addDays(new Date(), -29));
    return habits
      .map((habit) => {
        const habitEntries = entriesByHabit.get(habit.id) ?? new Map<string, HabitEntryRow>();
        return {
          habit,
          rate: completionRate({
            isCompleted: (key) => habitEntries.get(key)?.completed === 1,
            isScheduled: (key) => isHabitScheduledOn(habit, key),
            startKey: start,
            endKey: today,
          }),
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [habits, entriesByHabit, today]);

  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    const categories = Array.from(new Set(habits.map((h) => h.category)));
    const start = dateKey(addDays(new Date(), -29));
    return categories
      .map((category) => ({
        category,
        rate: aggregateRate(start, today, habits.filter((h) => h.category === category)),
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [habits, aggregateRate, today]);

  return {
    isLoaded: habitsLoaded && isLoaded,
    hasHabits: habits.length > 0,
    hasHistory: entries.length > 0,
    consistencyScore,
    consistencyDelta,
    completionRateLast30,
    weeklyCompletion,
    consistencyTrend,
    heatmap,
    streaks,
    habitPerformance,
    categoryBreakdown,
  };
}
