import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useRewards, type AchievementView } from '@/hooks/use-rewards';
import { useTheme } from '@/hooks/use-theme';

export default function RewardsScreen() {
  const { totalPoints, levelInfo, achievements, isLoaded } = useRewards();
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = achievements.find((a) => a.id === selectedId) ?? null;

  return (
    <Screen>
      <View style={{ paddingVertical: Spacing.four, gap: Spacing.half }}>
        <ThemedText type="title">Rewards</ThemedText>
        <ThemedText themeColor="textSecondary">Progress you can see.</ThemedText>
      </View>

      <Card elevated style={{ gap: Spacing.two, marginBottom: Spacing.five }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 2 }}>
            <ThemedText type="label" themeColor="accent">
              Level {levelInfo.level}
            </ThemedText>
            <ThemedText type="heading">{levelInfo.name}</ThemedText>
          </View>
          <ThemedText type="title">{totalPoints.toLocaleString()} XP</ThemedText>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(Math.min(1, Math.max(0, levelInfo.progress)) * 100)}%`, backgroundColor: theme.accent },
            ]}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {levelInfo.pointsToNextLevel.toLocaleString()} XP until Level {levelInfo.level + 1}
        </ThemedText>
      </Card>

      <ThemedText type="heading" style={{ marginBottom: Spacing.three }}>
        Milestones
      </ThemedText>

      {isLoaded && (
        <View style={styles.grid}>
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              selected={achievement.id === selectedId}
              onPress={() => setSelectedId((current) => (current === achievement.id ? null : achievement.id))}
            />
          ))}
        </View>
      )}

      {selected && (
        <Card style={{ marginTop: Spacing.four }}>
          <ThemedText type="bodyBold">{selected.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2 }}>
            {selected.description}
          </ThemedText>
          <ThemedText type="small" themeColor={selected.unlocked ? 'success' : 'textMuted'} style={{ marginTop: Spacing.two }}>
            {selected.unlocked && selected.unlockedAt
              ? `Earned ${new Date(selected.unlockedAt).toLocaleDateString()}`
              : 'Not unlocked yet'}
          </ThemedText>
        </Card>
      )}
    </Screen>
  );
}

function AchievementBadge({
  achievement,
  selected,
  onPress,
}: {
  achievement: AchievementView;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.badgeWrap}>
      <View
        style={[
          styles.badgeCircle,
          {
            backgroundColor: achievement.unlocked ? theme.accentSoft : theme.surface,
            borderColor: selected ? theme.accent : theme.border,
            opacity: achievement.unlocked ? 1 : 0.55,
          },
        ]}>
        <ThemedText style={{ fontSize: 26 }}>{achievement.unlocked ? achievement.icon : '🔒'}</ThemedText>
      </View>
      <ThemedText type="small" themeColor={achievement.unlocked ? 'text' : 'textMuted'} style={styles.badgeLabel}>
        {achievement.title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  badgeWrap: {
    width: 84,
    alignItems: 'center',
    gap: Spacing.one,
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    textAlign: 'center',
  },
});
