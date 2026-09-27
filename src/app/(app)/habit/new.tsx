import { router } from 'expo-router';
import { useState } from 'react';

import { HabitForm, type HabitFormValues } from '@/components/habit-form';
import { Screen } from '@/components/ui/screen';
import { useHabits } from '@/hooks/use-habits';

export default function NewHabitScreen() {
  const { addHabit } = useHabits();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: HabitFormValues) {
    setSubmitting(true);
    await addHabit(values);
    setSubmitting(false);
    router.back();
  }

  return (
    <Screen withTabInset={false}>
      <HabitForm submitLabel="Create habit" submitting={submitting} onSubmit={handleSubmit} />
    </Screen>
  );
}
