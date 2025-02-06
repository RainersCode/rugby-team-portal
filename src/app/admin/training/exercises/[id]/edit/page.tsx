import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ExerciseForm from '@/components/features/Training/Admin/ExerciseForm';
import { Exercise } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditExercisePage({
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

  // Fetch exercise data
  const { data: exercise } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!exercise) {
    redirect('/admin/training');
  }

  return (
    <div className="container-width mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Exercise
        </h1>
        <ExerciseForm initialData={exercise as Exercise} />
      </div>
    </div>
  );
} 