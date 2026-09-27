import { generateId } from '@/lib/id';
import type { AchievementRow } from './types';
import { getTable, setTable } from './web-store';

export async function listUnlockedAchievements(_db: unknown, userId: string): Promise<AchievementRow[]> {
  const achievements = await getTable('achievements');
  return achievements.filter((a) => a.userId === userId);
}

export async function unlockAchievement(_db: unknown, userId: string, achievementType: string): Promise<boolean> {
  const achievements = await getTable('achievements');
  if (achievements.some((a) => a.userId === userId && a.achievementType === achievementType)) return false;

  const row: AchievementRow = { id: generateId(), userId, achievementType, unlockedAt: new Date().toISOString() };
  await setTable('achievements', [...achievements, row]);
  return true;
}
