import type { SQLiteDatabase } from 'expo-sqlite';

/** Wipes every habit, entry, reward, and achievement for this user — used by "Reset demo data" and account-level resets. */
export async function resetUserData(db: SQLiteDatabase, userId: string): Promise<void> {
  await db.runAsync('DELETE FROM habit_entries WHERE habitId IN (SELECT id FROM habits WHERE userId = ?)', [userId]);
  await db.runAsync('DELETE FROM habits WHERE userId = ?', [userId]);
  await db.runAsync('DELETE FROM reward_transactions WHERE userId = ?', [userId]);
  await db.runAsync('DELETE FROM achievements WHERE userId = ?', [userId]);
}
