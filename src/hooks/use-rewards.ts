import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { listUnlockedAchievements } from '@/db/achievements';
import { useDb } from '@/db/provider';
import { getTotalPoints, listRewardTransactions } from '@/db/rewards';
import type { AchievementRow, RewardTransactionRow } from '@/db/types';
import { ACHIEVEMENTS } from '@/lib/achievements-catalog';
import { getLevelInfo } from '@/lib/rewards-engine';

export type AchievementView = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
};

export function useRewards() {
  const db = useDb();
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlocked, setUnlocked] = useState<AchievementRow[]>([]);
  const [transactions, setTransactions] = useState<RewardTransactionRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setTotalPoints(0);
      setUnlocked([]);
      setTransactions([]);
      setIsLoaded(true);
      return;
    }
    const [points, achievements, txs] = await Promise.all([
      getTotalPoints(db, user.id),
      listUnlockedAchievements(db, user.id),
      listRewardTransactions(db, user.id),
    ]);
    setTotalPoints(points);
    setUnlocked(achievements);
    setTransactions(txs);
    setIsLoaded(true);
  }, [db, user]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const levelInfo = useMemo(() => getLevelInfo(totalPoints), [totalPoints]);

  const achievements: AchievementView[] = useMemo(() => {
    const unlockedMap = new Map(unlocked.map((a) => [a.achievementType, a.unlockedAt]));
    return ACHIEVEMENTS.map((def) => ({
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked: unlockedMap.has(def.id),
      unlockedAt: unlockedMap.get(def.id) ?? null,
    }));
  }, [unlocked]);

  return { totalPoints, levelInfo, achievements, transactions, isLoaded, reload };
}
