import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TrainingProgram } from '@/types';
import TrainingPageClient from './TrainingPageClient';

export const dynamic = 'force-dynamic';

export default async function TrainingPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const { data: programs, error } = await supabase
      .from('training_programs')
      .select('id, title, description, difficulty, duration_weeks, target_audience, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching programs:', error);
    }

    // Group programs by difficulty
    const groupedPrograms = (programs || []).reduce((acc, program) => {
      if (!acc[program.difficulty]) {
        acc[program.difficulty] = [];
      }
      acc[program.difficulty].push(program);
      return acc;
    }, {} as Record<string, TrainingProgram[]>);

    return <TrainingPageClient groupedPrograms={groupedPrograms} />;
  } catch (error) {
    console.error('Error in TrainingPage:', error);
    return <div>Error loading training page</div>;
  }
} 