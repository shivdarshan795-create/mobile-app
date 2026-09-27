import type { Href } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const TABS: { name: string; href: Href; label: string }[] = [
  { name: 'today', href: '/', label: 'Today' },
  { name: 'insights', href: '/insights', label: 'Insights' },
  { name: 'rewards', href: '/rewards', label: 'Rewards' },
  { name: 'profile', href: '/profile', label: 'Profile' },
];

export default function WebTabsLayout() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <View style={styles.tabListContainer}>
          <ThemedView type="surfaceElevated" style={styles.innerContainer}>
            {TABS.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <TabButton>{tab.label}</TabButton>
              </TabTrigger>
            ))}
          </ThemedView>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <ThemedView type={isFocused ? 'accentSoft' : 'surfaceElevated'} style={styles.tabButtonInner}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'accent' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.five,
    maxWidth: MaxContentWidth,
  },
  tabButton: {
    borderRadius: Spacing.three,
  },
  tabButtonInner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
