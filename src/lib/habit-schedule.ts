import type { Habit } from '@/db/types';
import { parseDateKey, weekdayIndex } from './date';

/** Whether `habit` is expected to be actioned on the given date. */
export function isHabitScheduledOn(habit: Pick<Habit, 'frequency' | 'weekdays' | 'startDate'>, key: string): boolean {
  if (key < habit.startDate) return false;
  if (habit.frequency === 'weekdays') {
    return (habit.weekdays ?? []).includes(weekdayIndex(parseDateKey(key)));
  }
  // 'daily' and 'timesPerWeek' habits are actionable every day; timesPerWeek's
  // weekly target is evaluated separately rather than pinned to fixed weekdays.
  return true;
}
