import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { HabitForm, type HabitFormValues } from '@/components/habit-form';
import { Screen } from '@/components/ui/screen';
import { useHabits } from '@/hooks/use-habits';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, editHabit, isLoaded } = useHabits(['active', 'paused', 'archived']);
  const [submitting, setSubmitting] = useState(false);

  const habit = useMemo(() => habits.find((h) => h.id === id) ?? null, [habits, id]);

  async function handleSubmit(values: HabitFormValues) {
    if (!id) return;
    setSubmitting(true);
    await editHabit(id, values);
    setSubmitting(false);
    router.back();
  }

  if (!isLoaded || !habit) return <Screen withTabInset={false} />;

  return (
    <Screen withTabInset={false}>
      <HabitForm initial={habit} submitLabel="Save changes" submitting={submitting} onSubmit={handleSubmit} />
    </Screen>
  );
}
