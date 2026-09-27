import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { createHabit, listHabits, setHabitStatus, updateHabit, type NewHabitInput, type UpdateHabitInput } from '@/db/habits';
import { useDb } from '@/db/provider';
import type { Habit, HabitStatus } from '@/db/types';
import { cancelHabitReminder, scheduleHabitReminder } from '@/lib/notifications';

export function useHabits(statuses: HabitStatus[] = ['active']) {
  const db = useDb();
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const statusKey = statuses.join(',');

  const reload = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setIsLoaded(true);
      return;
    }
    const rows = await listHabits(db, user.id, statusKey.split(',') as HabitStatus[]);
    setHabits(rows);
    setIsLoaded(true);
  }, [db, user, statusKey]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const addHabit = useCallback(
    async (input: Omit<NewHabitInput, 'userId'>) => {
      if (!user) return;
      const habit = await createHabit(db, { ...input, userId: user.id });
      if (habit.reminderTime) {
        const notificationId = await scheduleHabitReminder(habit);
        if (notificationId) await updateHabit(db, habit.id, { reminderNotificationId: notificationId });
      }
      await reload();
    },
    [db, user, reload]
  );

  const editHabit = useCallback(
    async (id: string, input: UpdateHabitInput) => {
      const existing = habits.find((h) => h.id === id);
      if (existing?.reminderNotificationId) await cancelHabitReminder(existing.reminderNotificationId);

      await updateHabit(db, id, { ...input, reminderNotificationId: undefined });
      if (input.reminderTime !== undefined) {
        if (input.reminderTime) {
          const updated = { ...existing, ...input } as Habit;
          const notificationId = await scheduleHabitReminder(updated);
          await updateHabit(db, id, { reminderNotificationId: notificationId ?? null });
        } else {
          await updateHabit(db, id, { reminderNotificationId: null });
        }
      }
      await reload();
    },
    [db, habits, reload]
  );

  const pauseHabit = useCallback(
    async (id: string) => {
      await setHabitStatus(db, id, 'paused');
      await reload();
    },
    [db, reload]
  );

  const resumeHabit = useCallback(
    async (id: string) => {
      await setHabitStatus(db, id, 'active');
      await reload();
    },
    [db, reload]
  );

  const archiveHabit = useCallback(
    async (id: string) => {
      const existing = habits.find((h) => h.id === id);
      if (existing?.reminderNotificationId) await cancelHabitReminder(existing.reminderNotificationId);
      await setHabitStatus(db, id, 'archived');
      await reload();
    },
    [db, habits, reload]
  );

  return { habits, isLoaded, reload, addHabit, editHabit, pauseHabit, resumeHabit, archiveHabit };
}
