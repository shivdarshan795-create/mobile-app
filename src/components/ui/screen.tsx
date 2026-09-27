import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  withTabInset?: boolean;
};

/** Standard scroll container for tab screens: safe-area aware, centers content on wide/web viewports. */
export function Screen({ children, contentStyle, withTabInset = true }: ScreenProps) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + (withTabInset ? BottomTabInset : 0) + Spacing.three,
  };
  const platformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentInset={insets}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.centerRow}>
      <View style={[styles.inner, platformStyle, contentStyle]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerRow: { flexDirection: 'row', justifyContent: 'center' },
  inner: {
    flexGrow: 1,
    alignSelf: 'stretch',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
  },
});
