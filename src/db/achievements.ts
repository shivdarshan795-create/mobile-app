import type { SQLiteDatabase } from 'expo-sqlite';

import { generateId } from '@/lib/id';
import type { AchievementRow } from './types';

export async function listUnlockedAchievements(db: SQLiteDatabase, userId: string): Promise<AchievementRow[]> {
  return db.getAllAsync<AchievementRow>('SELECT * FROM achievements WHERE userId = ?', [userId]);
}

/** Inserts the achievement if not already unlocked. Returns true if this call newly unlocked it. */
export async function unlockAchievement(
  db: SQLiteDatabase,
  userId: string,
  achievementType: string
): Promise<boolean> {
  const existing = await db.getFirstAsync(
    'SELECT id FROM achievements WHERE userId = ? AND achievementType = ?',
    [userId, achievementType]
  );
  if (existing) return false;

  await db.runAsync(
    'INSERT INTO achievements (id, userId, achievementType, unlockedAt) VALUES (?, ?, ?, ?)',
    [generateId(), userId, achievementType, new Date().toISOString()]
  );
  return true;
}
