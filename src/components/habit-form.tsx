import type { ReactNode } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { TextField } from '@/components/ui/text-field';
import { TimeStepper } from '@/components/ui/time-stepper';
import { Spacing } from '@/constants/theme';
import type { Habit, HabitCategory, HabitFrequency, HabitType, TimeOfDay } from '@/db/types';
import { HABIT_ICONS } from '@/lib/habit-icons';
import { todayKey } from '@/lib/date';

const CATEGORIES: HabitCategory[] = ['health', 'fitness', 'mind', 'learning', 'productivity', 'personal'];
const TYPES: { value: HabitType; label: string }[] = [
  { value: 'yesno', label: 'Yes / No' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'duration', label: 'Duration' },
];
const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Specific days' },
  { value: 'timesPerWeek', label: 'X times/week' },
];
const TIMES_OF_DAY: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Anytime' },
];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export type HabitFormValues = {
  title: string;
  icon: string;
  category: HabitCategory;
  type: HabitType;
  targetValue: number;
  unit: string | null;
  frequency: HabitFrequency;
  weekdays: number[] | null;
  timesPerWeek: number | null;
  timeOfDay: TimeOfDay;
  reminderTime: string | null;
  startDate: string;
};

function fromHabit(habit?: Habit | null): HabitFormValues {
  return {
    title: habit?.title ?? '',
    icon: habit?.icon ?? HABIT_ICONS[0],
    category: habit?.category ?? 'personal',
    type: habit?.type ?? 'yesno',
    targetValue: habit?.targetValue ?? 1,
    unit: habit?.unit ?? null,
    frequency: habit?.frequency ?? 'daily',
    weekdays: habit?.weekdays ?? null,
    timesPerWeek: habit?.timesPerWeek ?? 3,
    timeOfDay: habit?.timeOfDay ?? 'anytime',
    reminderTime: habit?.reminderTime ?? null,
    startDate: habit?.startDate ?? todayKey(),
  };
}

type HabitFormProps = {
  initial?: Habit | null;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: HabitFormValues) => void;
};

export function HabitForm({ initial, submitLabel, submitting, onSubmit }: HabitFormProps) {
  const [values, setValues] = useState<HabitFormValues>(() => fromHabit(initial));

  function update<K extends keyof HabitFormValues>(key: K, value: HabitFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleWeekday(day: number) {
    const current = values.weekdays ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort();
    update('weekdays', next);
  }

  const canSubmit =
    values.title.trim().length > 0 &&
    (values.type === 'yesno' || values.targetValue > 0) &&
    (values.frequency !== 'weekdays' || (values.weekdays?.length ?? 0) > 0);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextField label="Habit name" value={values.title} onChangeText={(t) => update('title', t)} placeholder="e.g. Read" />

      <Field label="Icon">
        <View style={styles.row}>
          {HABIT_ICONS.map((icon) => (
            <Chip key={icon} label={icon} selected={icon === values.icon} onPress={() => update('icon', icon)} />
          ))}
        </View>
      </Field>

      <Field label="Category">
        <Row>
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              selected={values.category === category}
              onPress={() => update('category', category)}
            />
          ))}
        </Row>
      </Field>

      <Field label="Habit type">
        <Row>
          {TYPES.map((t) => (
            <Chip key={t.value} label={t.label} selected={values.type === t.value} onPress={() => update('type', t.value)} />
          ))}
        </Row>
      </Field>

      {values.type !== 'yesno' && (
        <View style={{ flexDirection: 'row', gap: Spacing.three }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Target"
              value={String(values.targetValue)}
              onChangeText={(t) => update('targetValue', Number(t.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Unit"
              value={values.unit ?? ''}
              onChangeText={(t) => update('unit', t)}
              placeholder={values.type === 'duration' ? 'min' : 'glasses'}
            />
          </View>
        </View>
      )}

      <Field label="Frequency">
        <Row>
          {FREQUENCIES.map((f) => (
            <Chip key={f.value} label={f.label} selected={values.frequency === f.value} onPress={() => update('frequency', f.value)} />
          ))}
        </Row>
      </Field>

      {values.frequency === 'weekdays' && (
        <Field label="Which days">
          <Row>
            {WEEKDAY_LABELS.map((label, index) => (
              <Chip key={index} label={label} selected={(values.weekdays ?? []).includes(index)} onPress={() => toggleWeekday(index)} />
            ))}
          </Row>
        </Field>
      )}

      {values.frequency === 'timesPerWeek' && (
        <TextField
          label="Times per week"
          value={String(values.timesPerWeek ?? 3)}
          onChangeText={(t) => update('timesPerWeek', Math.min(7, Number(t.replace(/[^0-9]/g, '')) || 1))}
          keyboardType="number-pad"
        />
      )}

      <Field label="Time of day">
        <Row>
          {TIMES_OF_DAY.map((t) => (
            <Chip key={t.value} label={t.label} selected={values.timeOfDay === t.value} onPress={() => update('timeOfDay', t.value)} />
          ))}
        </Row>
      </Field>

      <Field label="Reminder">
        <Row>
          <Chip label="Off" selected={!values.reminderTime} onPress={() => update('reminderTime', null)} />
          <Chip label="On" selected={!!values.reminderTime} onPress={() => update('reminderTime', values.reminderTime ?? '08:00')} />
        </Row>
        {values.reminderTime && (
          <View style={{ marginTop: Spacing.two }}>
            <TimeStepper value={values.reminderTime} onChange={(t) => update('reminderTime', t)} />
          </View>
        )}
      </Field>

      <Button label={submitLabel} onPress={() => onSubmit(values)} disabled={!canSubmit} loading={submitting} />
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.two }}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
