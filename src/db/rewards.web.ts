import { todayKey } from '@/lib/date';
import { generateId } from '@/lib/id';
import type { RewardTransactionRow, RewardType } from './types';
import { getTable, setTable } from './web-store';

export async function addRewardTransaction(
  _db: unknown,
  params: { userId: string; type: RewardType; points: number; source?: string; habitId?: string; date?: string }
): Promise<RewardTransactionRow> {
  const transactions = await getTable('reward_transactions');
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
  await setTable('reward_transactions', [...transactions, row]);
  return row;
}

export async function getTotalPoints(_db: unknown, userId: string): Promise<number> {
  const transactions = await getTable('reward_transactions');
  return transactions.filter((t) => t.userId === userId).reduce((sum, t) => sum + t.points, 0);
}

export async function listRewardTransactions(_db: unknown, userId: string): Promise<RewardTransactionRow[]> {
  const transactions = await getTable('reward_transactions');
  return transactions.filter((t) => t.userId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function hasRewardForDate(
  _db: unknown,
  params: { userId: string; type: RewardType; date: string; habitId?: string }
): Promise<boolean> {
  const transactions = await getTable('reward_transactions');
  return transactions.some(
    (t) =>
      t.userId === params.userId &&
      t.type === params.type &&
      t.date === params.date &&
      (params.habitId ? t.habitId === params.habitId : t.habitId == null)
  );
}
