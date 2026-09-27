import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type LinePoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: LinePoint[];
  height?: number;
  /** Format the raw value for the touch tooltip. */
  formatValue?: (value: number) => string;
};

export function LineChart({ data, height = 120, formatValue }: LineChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: i * stepX,
    y: height - ((d.value - min) / range) * (height - 12) - 6,
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  function handleTouch(event: GestureResponderEvent) {
    if (stepX === 0) return;
    const touchX = event.nativeEvent.locationX;
    const index = Math.round(touchX / stepX);
    setActiveIndex(Math.max(0, Math.min(data.length - 1, index)));
  }

  const active = activeIndex !== null ? data[activeIndex] : null;
  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <View onLayout={handleLayout}>
      {active && activePoint && (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              backgroundColor: theme.text,
              left: Math.min(Math.max(activePoint.x - 34, 0), Math.max(width - 68, 0)),
            },
          ]}>
          <ThemedText type="smallBold" style={{ color: theme.background }}>
            {formatValue ? formatValue(active.value) : active.value}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.background, opacity: 0.7 }}>
            {active.label}
          </ThemedText>
        </View>
      )}

      {width > 0 && (
        <View
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouch}
          onResponderMove={handleTouch}
          onResponderRelease={() => setActiveIndex(null)}>
          <Svg width={width} height={height}>
            <Line x1={0} y1={height - 6} x2={width} y2={height - 6} stroke={theme.border} strokeWidth={1} />
            <Polyline
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={theme.accent}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {activePoint && (
              <Circle cx={activePoint.x} cy={activePoint.y} r={5} fill={theme.accent} stroke={theme.surface} strokeWidth={2} />
            )}
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: -8,
    zIndex: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    alignItems: 'center',
  },
});
