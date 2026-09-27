import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ToastContent = { points: number; message?: string };

export function RewardToast({ toast }: { toast: ToastContent | null }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const lastToast = useRef<ToastContent | null>(null);
  if (toast) lastToast.current = toast;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: toast ? 1 : 0, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: toast ? 0 : -12, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [toast, opacity, translateY]);

  const display = lastToast.current;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { backgroundColor: theme.text, opacity, transform: [{ translateY }] }]}>
      {display && (
        <>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            +{display.points} points
          </ThemedText>
          {display.message && (
            <ThemedText type="small" style={{ color: theme.background, opacity: 0.75 }}>
              {display.message}
            </ThemedText>
          )}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: Spacing.four,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    alignItems: 'center',
    zIndex: 10,
  },
});
