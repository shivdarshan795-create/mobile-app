import type { SQLiteDatabase } from 'expo-sqlite';

import { generateId } from '@/lib/id';
import type { HabitEntryRow } from './types';

export async function getEntry(db: SQLiteDatabase, habitId: string, date: string): Promise<HabitEntryRow | null> {
  const row = await db.getFirstAsync<HabitEntryRow>(
    'SELECT * FROM habit_entries WHERE habitId = ? AND date = ?',
    [habitId, date]
  );
  return row ?? null;
}

export async function getEntriesForHabit(
  db: SQLiteDatabase,
  habitId: string,
  startKey: string,
  endKey: string
): Promise<HabitEntryRow[]> {
  return db.getAllAsync<HabitEntryRow>(
    'SELECT * FROM habit_entries WHERE habitId = ? AND date BETWEEN ? AND ? ORDER BY date ASC',
    [habitId, startKey, endKey]
  );
}

/** All entries for a user's habits within a date range, for Today/Insights aggregation. */
export async function getEntriesForUserRange(
  db: SQLiteDatabase,
  userId: string,
  startKey: string,
  endKey: string
): Promise<HabitEntryRow[]> {
  return db.getAllAsync<HabitEntryRow>(
    `SELECT e.* FROM habit_entries e
     INNER JOIN habits h ON h.id = e.habitId
     WHERE h.userId = ? AND e.date BETWEEN ? AND ?
     ORDER BY e.date ASC`,
    [userId, startKey, endKey]
  );
}

/**
 * Sets (or clears) a habit's value for a date, deriving `completed` from the habit's target.
 * Uses an upsert so re-tapping the same day updates in place rather than duplicating rows.
 */
export async function upsertEntry(
  db: SQLiteDatabase,
  params: { habitId: string; date: string; value: number; targetValue: number }
): Promise<HabitEntryRow> {
  const completed = params.value >= params.targetValue && params.value > 0 ? 1 : 0;
  const completedAt = completed ? new Date().toISOString() : null;
  const existing = await getEntry(db, params.habitId, params.date);

  if (existing) {
    await db.runAsync(
      'UPDATE habit_entries SET value = ?, completed = ?, completedAt = ? WHERE id = ?',
      [params.value, completed, completedAt, existing.id]
    );
    return { ...existing, value: params.value, completed, completedAt };
  }

  const row: HabitEntryRow = {
    id: generateId(),
    habitId: params.habitId,
    date: params.date,
    value: params.value,
    completed,
    completedAt,
  };
  await db.runAsync(
    'INSERT INTO habit_entries (id, habitId, date, value, completed, completedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [row.id, row.habitId, row.date, row.value, row.completed, row.completedAt]
  );
  return row;
}

export async function deleteEntry(db: SQLiteDatabase, habitId: string, date: string): Promise<void> {
  await db.runAsync('DELETE FROM habit_entries WHERE habitId = ? AND date = ?', [habitId, date]);
}

export async function countCompletedEntries(db: SQLiteDatabase, userId: string): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM habit_entries e
     INNER JOIN habits h ON h.id = e.habitId
     WHERE h.userId = ? AND e.completed = 1`,
    [userId]
  );
  return result?.count ?? 0;
}
