import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BarChart } from '@/components/ui/bar-chart';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heatmap } from '@/components/ui/heatmap';
import { LineChart } from '@/components/ui/line-chart';
import { Screen } from '@/components/ui/screen';
import { StatTile } from '@/components/ui/stat-tile';
import { CategoryColors, Spacing } from '@/constants/theme';
import { useInsights } from '@/hooks/use-insights';

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function InsightsScreen() {
  const insights = useInsights();

  if (insights.isLoaded && !insights.hasHabits) {
    return (
      <Screen>
        <View style={{ paddingVertical: Spacing.four }}>
          <ThemedText type="title">Insights</ThemedText>
        </View>
        <EmptyState
          icon="📊"
          title="Nothing to analyze yet."
          message="Add a habit and complete a few days — your patterns will appear here."
        />
      </Screen>
    );
  }

  const deltaLabel =
    insights.consistencyDelta === 0
      ? 'Same as last week'
      : `${insights.consistencyDelta > 0 ? '+' : ''}${Math.round(insights.consistencyDelta * 100)}% compared with last week`;

  return (
    <Screen>
      <View style={{ paddingVertical: Spacing.four, gap: Spacing.half }}>
        <ThemedText type="title">Insights</ThemedText>
        <ThemedText themeColor="textSecondary">Are you actually getting better?</ThemedText>
      </View>

      <Card elevated style={{ gap: Spacing.one, marginBottom: Spacing.four }}>
        <ThemedText type="label" themeColor="textSecondary">
          Consistency
        </ThemedText>
        <ThemedText type="display">{pct(insights.consistencyScore)}</ThemedText>
        <ThemedText type="small" themeColor={insights.consistencyDelta >= 0 ? 'success' : 'danger'}>
          {deltaLabel}
        </ThemedText>
      </Card>

      {!insights.hasHistory ? (
        <EmptyState
          icon="📈"
          title="Complete a few days and your patterns will appear here."
          message="Charts need a little history to mean something."
        />
      ) : (
        <>
          <Section title="This week">
            <BarChart data={insights.weeklyCompletion} />
          </Section>

          <Section title="Consistency trend">
            <LineChart data={insights.consistencyTrend} formatValue={(v) => pct(v)} />
          </Section>

          <Section title="Habit heatmap">
            <Heatmap data={insights.heatmap} />
          </Section>

          <View style={{ flexDirection: 'row', gap: Spacing.three, marginBottom: Spacing.four }}>
            <StatTile label="Current streak" value={`${insights.streaks.current}`} sublabel="days" />
            <StatTile label="Best streak" value={`${insights.streaks.best}`} sublabel="days" />
          </View>

          <View style={{ marginBottom: Spacing.four }}>
            <StatTile label="Completion rate" value={pct(insights.completionRateLast30)} sublabel="last 30 days" />
          </View>

          <Section title="Habit performance">
            <View style={{ gap: Spacing.three }}>
              {insights.habitPerformance.map((entry) => (
                <RankRow key={entry.habit.id} label={entry.habit.title} rate={entry.rate} />
              ))}
            </View>
          </Section>

          <Section title="Category breakdown" last>
            <View style={{ gap: Spacing.three }}>
              {insights.categoryBreakdown.map((entry) => (
                <RankRow
                  key={entry.category}
                  label={capitalize(entry.category)}
                  rate={entry.rate}
                  color={CategoryColors[entry.category]}
                />
              ))}
            </View>
          </Section>
        </>
      )}
    </Screen>
  );
}

function Section({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <View style={{ marginBottom: last ? Spacing.six : Spacing.five, gap: Spacing.three }}>
      <ThemedText type="heading">{title}</ThemedText>
      {children}
    </View>
  );
}

function RankRow({ label, rate, color }: { label: string; rate: number; color?: string }) {
  return (
    <View style={{ gap: Spacing.one }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText type="default">{label}</ThemedText>
        <ThemedText type="bodyBold">{pct(rate)}</ThemedText>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: `${color ?? '#4640C2'}22`, overflow: 'hidden' }}>
        <View
          style={{
            width: `${Math.round(Math.max(0, Math.min(1, rate)) * 100)}%`,
            height: '100%',
            backgroundColor: color ?? '#4640C2',
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}
