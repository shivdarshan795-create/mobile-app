import type { Habit } from '@/db/types';

/** A sensible default increment for the quick "+" control, scaled to the habit's target size. */
export function defaultStepFor(habit: Pick<Habit, 'type' | 'targetValue'>): number {
  if (habit.type === 'duration') return Math.max(1, Math.round(habit.targetValue / 4));
  if (habit.type === 'quantity') return habit.targetValue >= 1000 ? Math.round(habit.targetValue / 8) : 1;
  return 1;
}
