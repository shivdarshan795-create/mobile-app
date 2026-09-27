import { addDays, dateKey, parseDateKey, todayKey } from './date';

type StreakParams = {
  isCompleted: (key: string) => boolean;
  isScheduled: (key: string) => boolean;
  minDateKey: string;
  from?: Date;
};

/** Consecutive scheduled-and-completed days ending today, skipping unscheduled days. Today not-yet-done doesn't break it. */
export function currentStreak({ isCompleted, isScheduled, minDateKey, from }: StreakParams): number {
  let cursor = from ?? new Date();
  const todayStr = dateKey(cursor);
  if (isScheduled(todayStr) && !isCompleted(todayStr)) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (dateKey(cursor) >= minDateKey) {
    const key = dateKey(cursor);
    if (isScheduled(key)) {
      if (!isCompleted(key)) break;
      streak += 1;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest consecutive scheduled-and-completed run within [minDateKey, maxDateKey]. */
export function bestStreak(params: {
  isCompleted: (key: string) => boolean;
  isScheduled: (key: string) => boolean;
  minDateKey: string;
  maxDateKey?: string;
}): number {
  const maxKey = params.maxDateKey ?? todayKey();
  let cursor = parseDateKey(params.minDateKey);
  let running = 0;
  let best = 0;
  while (dateKey(cursor) <= maxKey) {
    const key = dateKey(cursor);
    if (params.isScheduled(key)) {
      if (params.isCompleted(key)) {
        running += 1;
        best = Math.max(best, running);
      } else {
        running = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

/** Fraction of scheduled days that were completed within [startKey, endKey]. */
export function completionRate(params: {
  isCompleted: (key: string) => boolean;
  isScheduled: (key: string) => boolean;
  startKey: string;
  endKey: string;
}): number {
  let scheduled = 0;
  let completed = 0;
  let cursor = parseDateKey(params.startKey);
  while (dateKey(cursor) <= params.endKey) {
    const key = dateKey(cursor);
    if (params.isScheduled(key)) {
      scheduled += 1;
      if (params.isCompleted(key)) completed += 1;
    }
    cursor = addDays(cursor, 1);
  }
  return scheduled === 0 ? 0 : completed / scheduled;
}
