import type { SQLiteDatabase } from 'expo-sqlite';

import { generateId } from '@/lib/id';
import { todayKey } from '@/lib/date';
import type { Habit, HabitCategory, HabitFrequency, HabitRow, HabitStatus, HabitType, TimeOfDay } from './types';

function toHabit(row: HabitRow): Habit {
  return {
    ...row,
    weekdays: row.weekdays ? (JSON.parse(row.weekdays) as number[]) : null,
  };
}

export type NewHabitInput = {
  userId: string;
  title: string;
  icon: string;
  category: HabitCategory;
  type: HabitType;
  targetValue: number;
  unit: string | null;
  frequency: HabitFrequency;
  weekdays: number[] | null;
  timesPerWeek: number | null;
  timeOfDay: TimeOfDay;
  reminderTime: string | null;
  startDate: string;
};

export async function createHabit(db: SQLiteDatabase, input: NewHabitInput): Promise<Habit> {
  const row: HabitRow = {
    id: generateId(),
    userId: input.userId,
    title: input.title.trim(),
    icon: input.icon,
    category: input.category,
    type: input.type,
    targetValue: input.targetValue,
    unit: input.unit,
    frequency: input.frequency,
    weekdays: input.weekdays ? JSON.stringify(input.weekdays) : null,
    timesPerWeek: input.timesPerWeek,
    timeOfDay: input.timeOfDay,
    reminderTime: input.reminderTime,
    reminderNotificationId: null,
    startDate: input.startDate,
    status: 'active',
    createdAt: todayKey(),
  };

  await db.runAsync(
    `INSERT INTO habits
      (id, userId, title, icon, category, type, targetValue, unit, frequency, weekdays, timesPerWeek, timeOfDay, reminderTime, reminderNotificationId, startDate, status, createdAt)
     VALUES
      ($id, $userId, $title, $icon, $category, $type, $targetValue, $unit, $frequency, $weekdays, $timesPerWeek, $timeOfDay, $reminderTime, $reminderNotificationId, $startDate, $status, $createdAt)`,
    {
      $id: row.id,
      $userId: row.userId,
      $title: row.title,
      $icon: row.icon,
      $category: row.category,
      $type: row.type,
      $targetValue: row.targetValue,
      $unit: row.unit,
      $frequency: row.frequency,
      $weekdays: row.weekdays,
      $timesPerWeek: row.timesPerWeek,
      $timeOfDay: row.timeOfDay,
      $reminderTime: row.reminderTime,
      $reminderNotificationId: row.reminderNotificationId,
      $startDate: row.startDate,
      $status: row.status,
      $createdAt: row.createdAt,
    }
  );

  return toHabit(row);
}

export async function listHabits(
  db: SQLiteDatabase,
  userId: string,
  statuses: HabitStatus[] = ['active']
): Promise<Habit[]> {
  const placeholders = statuses.map(() => '?').join(',');
  const rows = await db.getAllAsync<HabitRow>(
    `SELECT * FROM habits WHERE userId = ? AND status IN (${placeholders}) ORDER BY createdAt ASC`,
    [userId, ...statuses]
  );
  return rows.map(toHabit);
}

export async function getHabit(db: SQLiteDatabase, id: string): Promise<Habit | null> {
  const row = await db.getFirstAsync<HabitRow>('SELECT * FROM habits WHERE id = ?', [id]);
  return row ? toHabit(row) : null;
}

export type UpdateHabitInput = Partial<
  Pick<
    HabitRow,
    | 'title'
    | 'icon'
    | 'category'
    | 'type'
    | 'targetValue'
    | 'unit'
    | 'frequency'
    | 'timesPerWeek'
    | 'timeOfDay'
    | 'reminderTime'
    | 'reminderNotificationId'
  >
> & { weekdays?: number[] | null };

export async function updateHabit(db: SQLiteDatabase, id: string, input: UpdateHabitInput): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    fields.push(`${key} = ?`);
    values.push(key === 'weekdays' ? (value ? JSON.stringify(value) : null) : (value as string | number | null));
  }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function setHabitStatus(db: SQLiteDatabase, id: string, status: HabitStatus): Promise<void> {
  await db.runAsync('UPDATE habits SET status = ? WHERE id = ?', [status, id]);
}
