import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ThemedText } from '@/components/themed-text';
import { AuthScreen } from '@/components/ui/auth-screen';
import { Button } from '@/components/ui/button';
import { IconCircle } from '@/components/ui/icon-circle';
import { TextField } from '@/components/ui/text-field';
import { CategoryColors, Radius, Spacing } from '@/constants/theme';
import { useDb } from '@/db/provider';
import { createHabit } from '@/db/habits';
import { todayKey } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';
import { GOALS, STARTER_HABITS, type Goal } from '@/lib/starter-habits';

export default function OnboardingScreen() {
  const db = useDb();
  const { user, completeOnboarding } = useAuth();
  const theme = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(user?.name ?? '');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const suggestions = goal ? STARTER_HABITS[goal] : [];

  function toggle(title: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  async function finish() {
    if (!user || !goal) return;
    setSubmitting(true);
    const startDate = todayKey();
    for (const habit of suggestions) {
      if (!selected.has(habit.title)) continue;
      await createHabit(db, {
        userId: user.id,
        title: habit.title,
        icon: habit.icon,
        category: habit.category,
        type: habit.type,
        targetValue: habit.targetValue,
        unit: habit.unit,
        frequency: 'daily',
        weekdays: null,
        timesPerWeek: null,
        timeOfDay: habit.timeOfDay,
        reminderTime: null,
        startDate,
      });
    }
    await completeOnboarding({ name: name.trim() || user.name, goal });
    setSubmitting(false);
    // Stack.Protected in root _layout.tsx switches to (app) automatically once onboardingComplete is true.
  }

  if (step === 1) {
    return (
      <AuthScreen>
        <View style={{ gap: Spacing.one }}>
          <ThemedText type="title">Let&apos;s set you up</ThemedText>
          <ThemedText themeColor="textSecondary">Two quick questions, then you&apos;re in.</ThemedText>
        </View>

        <View style={{ gap: Spacing.three, width: '100%' }}>
          <TextField label="What should we call you?" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Alex" />

          <View style={{ gap: Spacing.two }}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              What&apos;s your main goal?
            </ThemedText>
            <View style={styles.goalGrid}>
              {GOALS.map((g) => {
                const isSelected = goal === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGoal(g)}
                    style={[
                      styles.goalTile,
                      {
                        borderColor: isSelected ? theme.accent : theme.border,
                        backgroundColor: isSelected ? theme.accentSoft : theme.surface,
                      },
                    ]}>
                    <ThemedText type="bodyBold" style={{ color: isSelected ? theme.accent : theme.text }}>
                      {g}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button label="Continue" onPress={() => setStep(2)} disabled={!name.trim() || !goal} />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <View style={{ gap: Spacing.one }}>
        <ThemedText type="title">Pick a few habits</ThemedText>
        <ThemedText themeColor="textSecondary">You can always add or change these later.</ThemedText>
      </View>

      <View style={{ gap: Spacing.two, width: '100%' }}>
        {suggestions.map((habit) => {
          const isSelected = selected.has(habit.title);
          return (
            <Pressable
              key={habit.title}
              onPress={() => toggle(habit.title)}
              style={[
                styles.habitRow,
                { borderColor: isSelected ? theme.accent : theme.border, backgroundColor: theme.surface },
              ]}>
              <IconCircle icon={habit.icon} color={CategoryColors[habit.category]} size={40} />
              <ThemedText type="bodyBold" style={{ flex: 1 }}>
                {habit.title}
              </ThemedText>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.text },
                  isSelected && { backgroundColor: theme.text },
                ]}>
                {isSelected && (
                  <ThemedText type="smallBold" themeColor="background">
                    ✓
                  </ThemedText>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button label={submitting ? 'Setting up...' : 'Start tracking'} onPress={finish} loading={submitting} disabled={selected.size === 0} />
      <Button label="Back" variant="ghost" onPress={() => setStep(1)} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  goalTile: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
