import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type HeatmapDatum = {
  date: string;
  /** 0..1 */
  intensity: number;
};

type HeatmapProps = {
  /** Oldest first, grouped into columns of 7 (Sun-Sat). */
  data: HeatmapDatum[];
  cellSize?: number;
};

export function Heatmap({ data, cellSize = 12 }: HeatmapProps) {
  const theme = useTheme();
  const columns: HeatmapDatum[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    columns.push(data.slice(i, i + 7));
  }

  function colorFor(intensity: number) {
    if (intensity <= 0) return theme.border;
    if (intensity < 0.34) return theme.accentSoft;
    if (intensity < 0.67) return `${theme.accent}99`;
    return theme.accent;
  }

  return (
    <View style={styles.row}>
      {columns.map((column, columnIndex) => (
        <View key={columnIndex} style={styles.column}>
          {column.map((cell) => (
            <View
              key={cell.date}
              style={[
                styles.cell,
                { width: cellSize, height: cellSize, backgroundColor: colorFor(cell.intensity) },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    gap: 4,
  },
  cell: {
    borderRadius: 3,
  },
});
