import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProgramForm from '@/components/features/Training/Admin/ProgramForm';
import { Exercise, TrainingProgram } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditProgramPage({
  params
}: {
  params: { id: string }
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // Fetch program data
  const { data: programData } = await supabase
    .from('training_programs_with_authors')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!programData) {
    redirect('/admin/training');
  }

  // Transform program data to include the author field
  const program = {
    ...programData,
    author: programData.author_email ? { email: programData.author_email } : null
  };

  // Fetch all exercises for the form
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  // Fetch program workouts with their exercises
  const { data: workouts } = await supabase
    .from('program_workouts')
    .select(`
      *,
      workout_exercises (
        id,
        exercise_id,
        sets,
        reps,
        duration_seconds,
        rest_seconds,
        notes,
        order_index
      )
    `)
    .eq('program_id', params.id)
    .order('week_number')
    .order('day_number');

  // Add workouts to program data
  const programWithWorkouts = {
    ...program,
    workouts: workouts?.map(workout => ({
      ...workout,
      exercises: workout.workout_exercises || []
    })) || []
  };

  return (
    <div className="container-width mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Training Program
        </h1>
        <ProgramForm 
          initialData={programWithWorkouts as TrainingProgram} 
          exercises={exercises as Exercise[] || []} 
        />
      </div>
    </div>
  );
} 