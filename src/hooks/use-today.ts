import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { getEntriesForUserRange } from '@/db/entries';
import { useDb } from '@/db/provider';
import type { Habit, HabitEntryRow } from '@/db/types';
import { todayKey } from '@/lib/date';
import { isHabitScheduledOn } from '@/lib/habit-schedule';
import { recordHabitProgress, type CompletionResult } from '@/lib/rewards-processor';
import { currentStreak } from '@/lib/streaks';
import { useHabits } from './use-habits';

export type TodayItem = {
  habit: Habit;
  value: number;
  completed: boolean;
  streak: number;
};

export function useToday() {
  const db = useDb();
  const { user } = useAuth();
  const { habits, isLoaded: habitsLoaded, reload: reloadHabits } = useHabits(['active']);
  const [entries, setEntries] = useState<HabitEntryRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const today = todayKey();

  const reloadEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setIsLoaded(true);
      return;
    }
    const earliest = habits.reduce((min, h) => (h.startDate < min ? h.startDate : min), today);
    const rows = await getEntriesForUserRange(db, user.id, earliest, today);
    setEntries(rows);
    setIsLoaded(true);
  }, [db, user, habits, today]);

  useFocusEffect(
    useCallback(() => {
      reloadEntries();
    }, [reloadEntries])
  );

  const items: TodayItem[] = useMemo(() => {
    const scheduled = habits.filter((h) => isHabitScheduledOn(h, today));
    return scheduled.map((habit) => {
      const entryMap = new Map(entries.filter((e) => e.habitId === habit.id).map((e) => [e.date, e]));
      const todayEntry = entryMap.get(today);
      const streak = currentStreak({
        isCompleted: (key) => entryMap.get(key)?.completed === 1,
        isScheduled: (key) => isHabitScheduledOn(habit, key),
        minDateKey: habit.startDate,
      });
      return { habit, value: todayEntry?.value ?? 0, completed: todayEntry?.completed === 1, streak };
    });
  }, [habits, entries, today]);

  const doneCount = items.filter((item) => item.completed).length;
  const progress = items.length === 0 ? 0 : doneCount / items.length;

  const setValue = useCallback(
    async (habit: Habit, value: number): Promise<CompletionResult | null> => {
      if (!user) return null;
      const result = await recordHabitProgress(db, { userId: user.id, habit, allActiveHabits: habits, value });
      await reloadEntries();
      return result;
    },
    [db, user, habits, reloadEntries]
  );

  const toggleYesNo = useCallback((item: TodayItem) => setValue(item.habit, item.completed ? 0 : 1), [setValue]);

  const incrementQuantity = useCallback(
    (item: TodayItem, step: number) => setValue(item.habit, Math.max(0, item.value + step)),
    [setValue]
  );

  return {
    items,
    doneCount,
    totalCount: items.length,
    progress,
    isLoaded: habitsLoaded && isLoaded,
    toggleYesNo,
    incrementQuantity,
    setValue,
    reload: useCallback(async () => {
      await reloadHabits();
      await reloadEntries();
    }, [reloadHabits, reloadEntries]),
  };
}
