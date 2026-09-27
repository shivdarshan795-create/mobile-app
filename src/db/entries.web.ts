import { generateId } from '@/lib/id';
import type { HabitEntryRow } from './types';
import { getTable, setTable } from './web-store';

export async function getEntry(_db: unknown, habitId: string, date: string): Promise<HabitEntryRow | null> {
  const entries = await getTable('habit_entries');
  return entries.find((e) => e.habitId === habitId && e.date === date) ?? null;
}

export async function getEntriesForHabit(
  _db: unknown,
  habitId: string,
  startKey: string,
  endKey: string
): Promise<HabitEntryRow[]> {
  const entries = await getTable('habit_entries');
  return entries
    .filter((e) => e.habitId === habitId && e.date >= startKey && e.date <= endKey)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function getEntriesForUserRange(
  _db: unknown,
  userId: string,
  startKey: string,
  endKey: string
): Promise<HabitEntryRow[]> {
  const [entries, habits] = await Promise.all([getTable('habit_entries'), getTable('habits')]);
  const habitIds = new Set(habits.filter((h) => h.userId === userId).map((h) => h.id));
  return entries
    .filter((e) => habitIds.has(e.habitId) && e.date >= startKey && e.date <= endKey)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function upsertEntry(
  _db: unknown,
  params: { habitId: string; date: string; value: number; targetValue: number }
): Promise<HabitEntryRow> {
  const entries = await getTable('habit_entries');
  const completed = params.value >= params.targetValue && params.value > 0 ? 1 : 0;
  const completedAt = completed ? new Date().toISOString() : null;
  const existingIndex = entries.findIndex((e) => e.habitId === params.habitId && e.date === params.date);

  if (existingIndex >= 0) {
    const updated: HabitEntryRow = { ...entries[existingIndex], value: params.value, completed, completedAt };
    const next = [...entries];
    next[existingIndex] = updated;
    await setTable('habit_entries', next);
    return updated;
  }

  const row: HabitEntryRow = {
    id: generateId(),
    habitId: params.habitId,
    date: params.date,
    value: params.value,
    completed,
    completedAt,
  };
  await setTable('habit_entries', [...entries, row]);
  return row;
}

export async function deleteEntry(_db: unknown, habitId: string, date: string): Promise<void> {
  const entries = await getTable('habit_entries');
  await setTable(
    'habit_entries',
    entries.filter((e) => !(e.habitId === habitId && e.date === date))
  );
}

export async function countCompletedEntries(_db: unknown, userId: string): Promise<number> {
  const [entries, habits] = await Promise.all([getTable('habit_entries'), getTable('habits')]);
  const habitIds = new Set(habits.filter((h) => h.userId === userId).map((h) => h.id));
  return entries.filter((e) => habitIds.has(e.habitId) && e.completed === 1).length;
}
