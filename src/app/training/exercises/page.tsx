import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Exercise, ExerciseCategory } from '@/types';
import ExercisesPageClient from './ExercisesPageClient';

export const dynamic = 'force-dynamic';

export default async function ExercisesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  // Group exercises by category
  const groupedExercises = (exercises || []).reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<ExerciseCategory, Exercise[]>);

  return <ExercisesPageClient groupedExercises={groupedExercises} />;
} 