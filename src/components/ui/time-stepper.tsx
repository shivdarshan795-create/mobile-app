import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

type TimeStepperProps = {
  /** 'HH:MM' 24-hour */
  value: string;
  onChange: (value: string) => void;
};

export function TimeStepper({ value, onChange }: TimeStepperProps) {
  const [hour, minute] = value.split(':').map(Number);

  function adjust(minutesDelta: number) {
    const total = (((hour * 60 + minute + minutesDelta) % 1440) + 1440) % 1440;
    const newHour = Math.floor(total / 60);
    const newMinute = total % 60;
    onChange(`${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`);
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }}>
      <StepButton label="−" onPress={() => adjust(-30)} />
      <ThemedText type="bodyBold" style={{ minWidth: 88, textAlign: 'center' }}>
        {formatTime(hour, minute)}
      </ThemedText>
      <StepButton label="+" onPress={() => adjust(30)} />
    </View>
  );
}

function StepButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ThemedText type="bodyBold" themeColor="accent">
        {label}
      </ThemedText>
    </Pressable>
  );
}
