import type { SQLiteDatabase } from 'expo-sqlite';

import { generateId } from '@/lib/id';
import { todayKey } from '@/lib/date';
import type { RewardTransactionRow, RewardType } from './types';

export async function addRewardTransaction(
  db: SQLiteDatabase,
  params: { userId: string; type: RewardType; points: number; source?: string; habitId?: string; date?: string }
): Promise<RewardTransactionRow> {
  const row: RewardTransactionRow = {
    id: generateId(),
    userId: params.userId,
    type: params.type,
    points: params.points,
    source: params.source ?? null,
    habitId: params.habitId ?? null,
    date: params.date ?? todayKey(),
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO reward_transactions (id, userId, type, points, source, habitId, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [row.id, row.userId, row.type, row.points, row.source, row.habitId, row.date, row.createdAt]
  );
  return row;
}

export async function getTotalPoints(db: SQLiteDatabase, userId: string): Promise<number> {
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(points) as total FROM reward_transactions WHERE userId = ?',
    [userId]
  );
  return result?.total ?? 0;
}

export async function listRewardTransactions(db: SQLiteDatabase, userId: string): Promise<RewardTransactionRow[]> {
  return db.getAllAsync<RewardTransactionRow>(
    'SELECT * FROM reward_transactions WHERE userId = ? ORDER BY createdAt DESC',
    [userId]
  );
}

/** Points already awarded for a given (userId, type, date, habitId) combo — used to prevent double-awarding daily bonuses. */
export async function hasRewardForDate(
  db: SQLiteDatabase,
  params: { userId: string; type: RewardType; date: string; habitId?: string }
): Promise<boolean> {
  const row = params.habitId
    ? await db.getFirstAsync(
        'SELECT id FROM reward_transactions WHERE userId = ? AND type = ? AND date = ? AND habitId = ?',
        [params.userId, params.type, params.date, params.habitId]
      )
    : await db.getFirstAsync(
        'SELECT id FROM reward_transactions WHERE userId = ? AND type = ? AND date = ? AND habitId IS NULL',
        [params.userId, params.type, params.date]
      );
  return row != null;
}
