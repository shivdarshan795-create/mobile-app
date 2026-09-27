import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { StatTile } from '@/components/ui/stat-tile';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useDb } from '@/db/provider';
import { resetUserData } from '@/db/reset';
import { updateWeekStart } from '@/db/users';
import { useProfileStats } from '@/hooks/use-profile-stats';
import { useRewards } from '@/hooks/use-rewards';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference, type ThemePreference } from '@/hooks/use-theme-preference';
import { seedDemoData } from '@/lib/seed';

export default function ProfileScreen() {
  const { user, signOut, resetPassword, refreshUser } = useAuth();
  const db = useDb();
  const theme = useTheme();
  const { preference, setPreference } = useThemePreference();
  const stats = useProfileStats();
  const { levelInfo } = useRewards();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  async function handleChangePassword() {
    if (!user || newPassword.length < 6) return;
    setBusy(true);
    const result = await resetPassword({ email: user.email, newPassword });
    setBusy(false);
    setPasswordMessage(result.success ? 'Password updated.' : result.error);
    if (result.success) setNewPassword('');
  }

  function handleSeedDemoData() {
    Alert.alert('Load demo data', 'This adds ~8 weeks of sample habits and history so you can explore Insights and Rewards.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Load',
        onPress: async () => {
          if (!user) return;
          setBusy(true);
          await seedDemoData(db, user.id);
          setBusy(false);
          Alert.alert('Demo data loaded', 'Head to Today, Insights, or Rewards to see it.');
        },
      },
    ]);
  }

  async function handleWeekStartChange(value: 'monday' | 'sunday') {
    if (!user) return;
    await updateWeekStart(db, user.id, value);
    await refreshUser();
  }

  function handleResetData() {
    Alert.alert('Reset all data', 'This permanently deletes every habit, entry, and reward for your account. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          setBusy(true);
          await resetUserData(db, user.id);
          setBusy(false);
          Alert.alert('Data reset', 'All habits and history have been cleared.');
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
          <ThemedText type="title" themeColor="accent">
            {initials}
          </ThemedText>
        </View>
        <ThemedText type="title">{user.name}</ThemedText>
        <ThemedText themeColor="textSecondary">{user.email}</ThemedText>
      </View>

      <View style={styles.statsGrid}>
        <StatTile label="Member since" value={new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} />
        <StatTile label="Level" value={`${levelInfo.level}`} sublabel={levelInfo.name} />
      </View>
      <View style={styles.statsGrid}>
        <StatTile label="Completed" value={`${stats.totalCompletions}`} sublabel="total" />
        <StatTile label="Longest streak" value={`${stats.longestCurrentStreak}`} sublabel="days" />
      </View>
      <View style={[styles.statsGrid, { marginBottom: Spacing.five }]}>
        <StatTile label="Perfect days" value={`${stats.totalPerfectDays}`} />
      </View>

      <SectionLabel>Settings</SectionLabel>
      <Card style={{ gap: Spacing.four, marginBottom: Spacing.five }}>
        <SettingRow label="Week starts on">
          <View style={{ flexDirection: 'row', gap: Spacing.two }}>
            <Chip label="Monday" selected={user.weekStartsOn === 'monday'} onPress={() => handleWeekStartChange('monday')} />
            <Chip label="Sunday" selected={user.weekStartsOn === 'sunday'} onPress={() => handleWeekStartChange('sunday')} />
          </View>
        </SettingRow>

        <SettingRow label="Theme">
          <View style={{ flexDirection: 'row', gap: Spacing.two }}>
            {(['system', 'light', 'dark'] as ThemePreference[]).map((option) => (
              <Chip
                key={option}
                label={option.charAt(0).toUpperCase() + option.slice(1)}
                selected={preference === option}
                onPress={() => setPreference(option)}
              />
            ))}
          </View>
        </SettingRow>

        <SettingRow label="Reminders">
          <ThemedText type="small" themeColor="textSecondary">
            Set per habit, in that habit&apos;s edit screen.
          </ThemedText>
        </SettingRow>
      </Card>

      <SectionLabel>Data</SectionLabel>
      <Card style={{ gap: Spacing.three, marginBottom: Spacing.five }}>
        <ThemedText type="small" themeColor="textSecondary">
          Everything is stored on this device. Use demo data to explore Insights and Rewards, or reset
          everything to start fresh.
        </ThemedText>
        <Button label="Load demo data" variant="secondary" onPress={handleSeedDemoData} disabled={busy} />
        <Button label="Reset all data" variant="danger" onPress={handleResetData} disabled={busy} />
      </Card>

      <SectionLabel>Account</SectionLabel>
      <Card style={{ gap: Spacing.three, marginBottom: Spacing.six }}>
        {!showPasswordForm ? (
          <Pressable onPress={() => setShowPasswordForm(true)}>
            <ThemedText type="bodyBold" themeColor="accent">
              Change password
            </ThemedText>
          </Pressable>
        ) : (
          <View style={{ gap: Spacing.two }}>
            <TextField
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="At least 6 characters"
            />
            {passwordMessage && (
              <ThemedText type="small" themeColor="textSecondary">
                {passwordMessage}
              </ThemedText>
            )}
            <Button label="Update password" onPress={handleChangePassword} loading={busy} disabled={newPassword.length < 6} />
          </View>
        )}

        <Pressable onPress={handleLogout}>
          <ThemedText type="bodyBold" themeColor="danger">
            Log out
          </ThemedText>
        </Pressable>
      </Card>
    </Screen>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <ThemedText type="label" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
      {children}
    </ThemedText>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.one }}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.five },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
});
