import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { TrainingProgram, ProgramWorkout } from '@/types';
import ProgramPageClient from './ProgramPageClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

async function getProgram(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: program, error } = await supabase
    .from('training_programs_with_authors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !program) {
    console.error('Error fetching program:', error);
    return null;
  }

  // Transform the data to match the TrainingProgram type
  return {
    ...program,
    author: program.author_email ? { email: program.author_email } : null
  } as TrainingProgram;
}

async function getProgramWorkouts(programId: string) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: workouts, error } = await supabase
    .from('program_workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercise_id (*)
      )
    `)
    .eq('program_id', programId)
    .order('week_number', { ascending: true })
    .order('day_number', { ascending: true });

  if (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }

  return workouts || [];
}

export default async function ProgramPage({ params }: PageProps) {
  const program = await getProgram(params.id);
  
  if (!program) {
    notFound();
  }

  const workouts = await getProgramWorkouts(params.id);

  return <ProgramPageClient program={program} workouts={workouts} />;
} 