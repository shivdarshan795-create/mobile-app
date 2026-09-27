import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconCircle } from '@/components/ui/icon-circle';
import { CategoryColors, Radius, Spacing } from '@/constants/theme';
import type { TodayItem } from '@/hooks/use-today';
import { useTheme } from '@/hooks/use-theme';
import { defaultStepFor } from '@/lib/habit-step';

type Props = {
  item: TodayItem;
  onToggle: () => void;
  onIncrement: (step: number) => void;
};

export function TodayHabitCard({ item, onToggle, onIncrement }: Props) {
  const theme = useTheme();
  const { habit, value, completed, streak } = item;
  const color = CategoryColors[habit.category];

  const progressLabel =
    habit.type === 'yesno'
      ? completed
        ? 'Completed'
        : 'Not completed'
      : `${Math.min(value, habit.targetValue)} / ${habit.targetValue}${habit.unit ? ` ${habit.unit}` : ''}`;

  return (
    <Pressable
      onPress={() => router.push(`/habit/${habit.id}`)}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
      <IconCircle icon={habit.icon} color={color} />

      <View style={styles.info}>
        <ThemedText type="bodyBold">{habit.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {progressLabel}
          {streak > 0 ? `  ·  🔥 ${streak}` : ''}
        </ThemedText>
      </View>

      {habit.type === 'yesno' ? (
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          style={[styles.checkbox, { borderColor: theme.text }, completed && { backgroundColor: theme.text, borderColor: theme.text }]}>
          {completed && (
            <ThemedText type="smallBold" themeColor="background">
              ✓
            </ThemedText>
          )}
        </Pressable>
      ) : completed ? (
        <View style={[styles.checkbox, { borderColor: theme.success, backgroundColor: theme.success }]}>
          <ThemedText type="smallBold" themeColor="background">
            ✓
          </ThemedText>
        </View>
      ) : (
        <Pressable
          onPress={() => onIncrement(defaultStepFor(habit))}
          hitSlop={8}
          style={[styles.stepButton, { backgroundColor: theme.accentSoft }]}>
          <ThemedText type="bodyBold" themeColor="accent">
            +
          </ThemedText>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.85,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
