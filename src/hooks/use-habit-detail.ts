import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { getEntriesForHabit } from '@/db/entries';
import { useDb } from '@/db/provider';
import type { Habit, HabitEntryRow } from '@/db/types';
import { lastNDateKeys, todayKey } from '@/lib/date';
import { isHabitScheduledOn } from '@/lib/habit-schedule';
import { bestStreak, completionRate, currentStreak } from '@/lib/streaks';

export function useHabitDetail(habit: Habit | null) {
  const db = useDb();
  const [entries, setEntries] = useState<HabitEntryRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!habit) {
      setEntries([]);
      setIsLoaded(true);
      return;
    }
    const rows = await getEntriesForHabit(db, habit.id, habit.startDate, todayKey());
    setEntries(rows);
    setIsLoaded(true);
  }, [db, habit]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const entryMap = useMemo(() => new Map(entries.map((e) => [e.date, e])), [entries]);
  const isCompleted = useCallback((key: string) => entryMap.get(key)?.completed === 1, [entryMap]);
  const isScheduled = useCallback((key: string) => (habit ? isHabitScheduledOn(habit, key) : false), [habit]);

  const stats = useMemo(() => {
    if (!habit) return { current: 0, best: 0, rate: 0, totalCompletions: 0 };
    return {
      current: currentStreak({ isCompleted, isScheduled, minDateKey: habit.startDate }),
      best: bestStreak({ isCompleted, isScheduled, minDateKey: habit.startDate }),
      rate: completionRate({ isCompleted, isScheduled, startKey: habit.startDate, endKey: todayKey() }),
      totalCompletions: entries.filter((e) => e.completed === 1).length,
    };
  }, [habit, isCompleted, isScheduled, entries]);

  const heatmapFor = useCallback(
    (days: number) => lastNDateKeys(days).map((key) => ({ date: key, intensity: isCompleted(key) ? 1 : 0 })),
    [isCompleted]
  );

  return { isLoaded, stats, heatmapFor };
}
