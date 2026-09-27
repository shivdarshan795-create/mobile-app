import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { PerfectDayCelebration } from '@/components/perfect-day-celebration';
import { RewardToast, type ToastContent } from '@/components/reward-toast';
import { ThemedText } from '@/components/themed-text';
import { TodayHabitCard } from '@/components/today-habit-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useHabits } from '@/hooks/use-habits';
import { useTheme } from '@/hooks/use-theme';
import { useToday, type TodayItem } from '@/hooks/use-today';
import type { CompletionResult } from '@/lib/rewards-processor';
import { formatFullDate } from '@/lib/date';
import { haptics } from '@/lib/haptics';

export default function TodayScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { items, doneCount, totalCount, progress, isLoaded, toggleYesNo, incrementQuantity } = useToday();
  const { habits: pausedHabits, resumeHabit } = useHabits(['paused']);
  const [toast, setToast] = useState<ToastContent | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!celebrate) return;
    const timer = setTimeout(() => setCelebrate(false), 2600);
    return () => clearTimeout(timer);
  }, [celebrate]);

  function handleResult(result: CompletionResult | null) {
    if (!result) return;
    if (result.points > 0) {
      haptics.success();
      setToast({ points: result.points, message: result.streak > 1 ? `${result.streak} day streak` : undefined });
    } else {
      haptics.light();
    }
    if (result.isPerfectDay) {
      setCelebrate(true);
    }
  }

  const remaining = totalCount - doneCount;
  const message =
    totalCount === 0
      ? undefined
      : remaining === 0
        ? 'Perfect day — everything is done.'
        : `You're ${remaining} habit${remaining === 1 ? '' : 's'} away from completing your day.`;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="title">
          {getGreeting()}, {firstName}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{formatFullDate(new Date())}</ThemedText>
      </View>

      {totalCount > 0 && (
        <View style={styles.ringSection}>
          <ProgressRing progress={progress} size={168} strokeWidth={14}>
            <ThemedText type="display">
              {doneCount}/{totalCount}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              habits completed
            </ThemedText>
          </ProgressRing>
          {message && (
            <ThemedText themeColor="textSecondary" style={styles.message}>
              {message}
            </ThemedText>
          )}
        </View>
      )}

      {isLoaded && totalCount === 0 && (
        <EmptyState icon="🌱" title="Start with one small habit." message="Add your first habit to see it here." />
      )}

      <View style={styles.list}>
        {items.map((item: TodayItem) => (
          <TodayHabitCard
            key={item.habit.id}
            item={item}
            onToggle={() => toggleYesNo(item).then(handleResult)}
            onIncrement={(step) => incrementQuantity(item, step).then(handleResult)}
          />
        ))}
      </View>

      <Pressable onPress={() => router.push('/habit/new')} style={[styles.addButton, { backgroundColor: theme.accent }]}>
        <ThemedText type="bodyBold" themeColor="onAccent">
          + Add habit
        </ThemedText>
      </Pressable>

      {pausedHabits.length > 0 && (
        <View style={styles.pausedSection}>
          <ThemedText type="label" themeColor="textSecondary">
            PAUSED
          </ThemedText>
          {pausedHabits.map((habit) => (
            <Pressable
              key={habit.id}
              onPress={() => router.push(`/habit/${habit.id}`)}
              style={[styles.pausedRow, { borderColor: theme.border }]}>
              <ThemedText themeColor="textSecondary" style={{ flex: 1 }}>
                {habit.icon} {habit.title}
              </ThemedText>
              <Pressable onPress={() => resumeHabit(habit.id)} hitSlop={8}>
                <ThemedText type="smallBold" themeColor="accent">
                  Resume
                </ThemedText>
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      <RewardToast toast={toast} />
      {celebrate && <PerfectDayCelebration />}
    </Screen>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  header: { gap: Spacing.half, paddingVertical: Spacing.four },
  ringSection: { alignItems: 'center', gap: Spacing.three, paddingBottom: Spacing.four },
  message: { textAlign: 'center', paddingHorizontal: Spacing.four },
  list: { gap: Spacing.two },
  addButton: {
    marginTop: Spacing.four,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pausedSection: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  pausedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
