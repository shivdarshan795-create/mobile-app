import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Habit } from '@/db/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Local notifications work in Expo Go; only remote push needs a dev build, which this app doesn't use. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

type ReminderHabit = Pick<Habit, 'title' | 'reminderTime' | 'frequency' | 'weekdays'>;

/** Schedules a repeating local reminder. Weekday habits get one WEEKLY trigger per selected day (ids joined with commas). */
export async function scheduleHabitReminder(habit: ReminderHabit): Promise<string | null> {
  if (!habit.reminderTime || Platform.OS === 'web') return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const [hour, minute] = habit.reminderTime.split(':').map(Number);
  const content = { title: 'Habit reminder', body: `Time for: ${habit.title}` };

  if (habit.frequency === 'weekdays' && habit.weekdays && habit.weekdays.length > 0) {
    const ids = await Promise.all(
      habit.weekdays.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: weekday + 1, // expo-notifications: 1 = Sunday, matching JS getDay() + 1
            hour,
            minute,
          },
        })
      )
    );
    return ids.join(',');
  }

  return Notifications.scheduleNotificationAsync({
    content,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function cancelHabitReminder(idOrIds: string): Promise<void> {
  const ids = idOrIds.split(',').filter(Boolean);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}
