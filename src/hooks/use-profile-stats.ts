import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { useDb } from '@/db/provider';
import { computeAchievementContext } from '@/lib/rewards-processor';
import { useHabits } from './use-habits';

const EMPTY_STATS = { totalCompletions: 0, bestStreakAcrossHabits: 0, totalPerfectDays: 0 };

export function useProfileStats() {
  const db = useDb();
  const { user } = useAuth();
  const { habits, isLoaded: habitsLoaded } = useHabits(['active']);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setStats(EMPTY_STATS);
      setIsLoaded(true);
      return;
    }
    const ctx = await computeAchievementContext(db, user.id, habits);
    setStats(ctx);
    setIsLoaded(true);
  }, [db, user, habits]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return {
    totalCompletions: stats.totalCompletions,
    longestCurrentStreak: stats.bestStreakAcrossHabits,
    totalPerfectDays: stats.totalPerfectDays,
    isLoaded: habitsLoaded && isLoaded,
  };
}
