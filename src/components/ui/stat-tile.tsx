import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type StatTileProps = {
  label: string;
  value: string;
  sublabel?: string;
};

export function StatTile({ label, value, sublabel }: StatTileProps) {
  return (
    <Card style={{ flex: 1, gap: Spacing.half }}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="title">{value}</ThemedText>
      {sublabel && (
        <ThemedText type="small" themeColor="textSecondary">
          {sublabel}
        </ThemedText>
      )}
    </Card>
  );
}
