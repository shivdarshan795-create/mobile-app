import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type IconCircleProps = {
  icon: string;
  color: string;
  size?: number;
};

/** Colored circular swatch behind a habit's chosen emoji icon. Alpha-blends `color` for the background tint. */
export function IconCircle({ icon, color, size = 44 }: IconCircleProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}1F`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ThemedText style={{ fontSize: size * 0.46 }}>{icon}</ThemedText>
    </View>
  );
}
