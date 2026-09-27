import { getTable, setTable } from './web-store';

export async function resetUserData(_db: unknown, userId: string): Promise<void> {
  const [habits, entries, transactions, achievements] = await Promise.all([
    getTable('habits'),
    getTable('habit_entries'),
    getTable('reward_transactions'),
    getTable('achievements'),
  ]);
  const removedHabitIds = new Set(habits.filter((h) => h.userId === userId).map((h) => h.id));

  await Promise.all([
    setTable('habits', habits.filter((h) => h.userId !== userId)),
    setTable('habit_entries', entries.filter((e) => !removedHabitIds.has(e.habitId))),
    setTable('reward_transactions', transactions.filter((t) => t.userId !== userId)),
    setTable('achievements', achievements.filter((a) => a.userId !== userId)),
  ]);
}
