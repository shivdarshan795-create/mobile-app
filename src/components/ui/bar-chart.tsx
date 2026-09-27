import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BarDatum = {
  label: string;
  /** 0..1 */
  value: number;
};

type BarChartProps = {
  data: BarDatum[];
  height?: number;
};

export function BarChart({ data, height = 140 }: BarChartProps) {
  const theme = useTheme();
  const trackHeight = height - 24;

  return (
    <View style={[styles.row, { height }]}>
      {data.map((d) => {
        const complete = d.value >= 1;
        return (
          <View key={d.label} style={styles.column}>
            <View style={[styles.track, { height: trackHeight, backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(4, trackHeight * Math.max(0, Math.min(1, d.value))),
                    backgroundColor: complete ? theme.accent : theme.accentSoft,
                  },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textMuted">
              {d.label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  track: {
    width: '100%',
    borderRadius: Radius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
});
