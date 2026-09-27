import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Heatmap } from '@/components/ui/heatmap';
import { IconCircle } from '@/components/ui/icon-circle';
import { Screen } from '@/components/ui/screen';
import { StatTile } from '@/components/ui/stat-tile';
import { CategoryColors, Spacing } from '@/constants/theme';
import { useHabitDetail } from '@/hooks/use-habit-detail';
import { useHabits } from '@/hooks/use-habits';

const PERIODS: { key: string; label: string; days: number }[] = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: '3months', label: '3 Months', days: 90 },
  { key: 'year', label: 'Year', days: 364 },
];

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, isLoaded: habitsLoaded, pauseHabit, resumeHabit, archiveHabit } = useHabits([
    'active',
    'paused',
    'archived',
  ]);
  const habit = useMemo(() => habits.find((h) => h.id === id) ?? null, [habits, id]);
  const { isLoaded, stats, heatmapFor } = useHabitDetail(habit);
  const [period, setPeriod] = useState(PERIODS[1]);

  if (!habitsLoaded || !habit) {
    return <Screen />;
  }

  const goalLabel = habit.type === 'yesno' ? 'Once a day' : `${habit.targetValue}${habit.unit ? ` ${habit.unit}` : ''}`;

  function confirmArchive() {
    Alert.alert('Archive habit', 'Its history stays saved, but it will stop showing on Today.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: () => habit && archiveHabit(habit.id) },
    ]);
  }

  return (
    <Screen withTabInset={false}>
      <Stack.Screen options={{ title: habit.title }} />

      <View style={{ alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four }}>
        <IconCircle icon={habit.icon} color={CategoryColors[habit.category]} size={56} />
        <ThemedText type="title">{habit.title}</ThemedText>
        <ThemedText themeColor="textSecondary">{goalLabel}</ThemedText>
        {habit.status !== 'active' && (
          <ThemedText type="smallBold" themeColor="warning">
            {habit.status === 'paused' ? 'Paused' : 'Archived'}
          </ThemedText>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.three }}>
        <StatTile label="Current streak" value={`${stats.current}`} sublabel="days" />
        <StatTile label="Best streak" value={`${stats.best}`} sublabel="days" />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.five }}>
        <StatTile label="Completion rate" value={`${Math.round(stats.rate * 100)}%`} />
        <StatTile label="Total completions" value={`${stats.totalCompletions}`} />
      </View>

      <ThemedText type="heading" style={{ marginBottom: Spacing.three }}>
        History
      </ThemedText>
      <View style={{ flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three }}>
        {PERIODS.map((p) => (
          <Chip key={p.key} label={p.label} selected={period.key === p.key} onPress={() => setPeriod(p)} />
        ))}
      </View>

      {isLoaded && (
        <Card style={{ marginBottom: Spacing.five }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Heatmap data={heatmapFor(period.days)} cellSize={period.days > 90 ? 8 : 12} />
          </ScrollView>
        </Card>
      )}

      <View style={{ gap: Spacing.three, marginBottom: Spacing.six }}>
        <Button label="Edit habit" variant="secondary" onPress={() => router.push(`/habit/${habit.id}/edit`)} />
        {habit.status === 'paused' ? (
          <Button label="Resume habit" variant="secondary" onPress={() => resumeHabit(habit.id)} />
        ) : habit.status === 'active' ? (
          <Button label="Pause habit" variant="secondary" onPress={() => pauseHabit(habit.id)} />
        ) : null}
        {habit.status !== 'archived' && <Button label="Archive habit" variant="danger" onPress={confirmArchive} />}
      </View>
    </Screen>
  );
}
