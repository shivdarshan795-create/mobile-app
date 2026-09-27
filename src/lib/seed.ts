import type { SQLiteDatabase } from 'expo-sqlite';

import { createHabit } from '@/db/habits';
import { upsertEntry } from '@/db/entries';
import { addRewardTransaction } from '@/db/rewards';
import type { HabitCategory, HabitType, TimeOfDay } from '@/db/types';
import { addDays, dateKey, todayKey } from './date';
import { POINTS } from './rewards-engine';

type SeedDef = {
  title: string;
  icon: string;
  category: HabitCategory;
  type: HabitType;
  targetValue: number;
  unit: string | null;
  timeOfDay: TimeOfDay;
  /** Probability the habit was completed on any given day, for realistic gaps and varying consistency. */
  consistency: number;
};

const SEED_HABITS: SeedDef[] = [
  { title: 'Drink water', icon: '💧', category: 'health', type: 'quantity', targetValue: 8, unit: 'glasses', timeOfDay: 'anytime', consistency: 0.85 },
  { title: 'Morning walk', icon: '🚶', category: 'fitness', type: 'quantity', targetValue: 8000, unit: 'steps', timeOfDay: 'morning', consistency: 0.7 },
  { title: 'Read', icon: '📖', category: 'learning', type: 'duration', targetValue: 20, unit: 'min', timeOfDay: 'evening', consistency: 0.6 },
  { title: 'Meditate', icon: '🧘', category: 'mind', type: 'duration', targetValue: 10, unit: 'min', timeOfDay: 'morning', consistency: 0.78 },
  { title: 'Journal', icon: '✍️', category: 'mind', type: 'yesno', targetValue: 1, unit: null, timeOfDay: 'evening', consistency: 0.5 },
];

/** Fills ~`weeks` of realistic history (mixed hits/misses, varying consistency) so Insights/Rewards have real data to show. */
export async function seedDemoData(db: SQLiteDatabase, userId: string, weeks = 8) {
  const totalDays = weeks * 7;
  const startDate = dateKey(addDays(new Date(), -(totalDays - 1)));
  const today = todayKey();

  for (const def of SEED_HABITS) {
    const habit = await createHabit(db, {
      userId,
      title: def.title,
      icon: def.icon,
      category: def.category,
      type: def.type,
      targetValue: def.targetValue,
      unit: def.unit,
      frequency: 'daily',
      weekdays: null,
      timesPerWeek: null,
      timeOfDay: def.timeOfDay,
      reminderTime: null,
      startDate,
    });

    for (let i = 0; i < totalDays; i += 1) {
      const date = dateKey(addDays(new Date(), -(totalDays - 1 - i)));
      if (date > today) break;
      if (Math.random() >= def.consistency) continue; // a missed day

      const value = def.type === 'yesno' ? 1 : Math.round(def.targetValue * (1 + Math.random() * 0.25));
      await upsertEntry(db, { habitId: habit.id, date, value, targetValue: def.targetValue });
      await addRewardTransaction(db, { userId, type: 'completion', points: POINTS.completion, habitId: habit.id, date });
    }
  }
}
