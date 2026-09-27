import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CONFETTI_COLORS = ['#4640C2', '#2E9B5A', '#B9791A', '#C2483F', '#8B5CB0'];
const CONFETTI_COUNT = 10;

export function PerfectDayCelebration() {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const confetti = useRef(Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.stagger(
        30,
        confetti.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true })
        )
      ),
    ]).start();
  }, [confetti, opacity, scale]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {confetti.map((v, i) => {
        const angle = (i / confetti.length) * Math.PI * 2;
        const distance = 90 + (i % 3) * 20;
        const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
        const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance + 40] });
        const dotOpacity = v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                opacity: dotOpacity,
                transform: [{ translateX }, { translateY }],
              },
            ]}
          />
        );
      })}

      <Animated.View style={[styles.cardWrap, { opacity }]}>
        <Animated.View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ scale }] }]}>
          <ThemedText style={{ fontSize: 28 }}>🎉</ThemedText>
          <ThemedText type="heading">Perfect day</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Every habit, done.
          </ThemedText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  confetti: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
