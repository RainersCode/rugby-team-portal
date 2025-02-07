import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ActivityForm from '../../ActivityForm';

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function EditActivityPage({ params }: Props) {
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

  // Fetch activity data
  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!activity) {
    redirect('/admin/activities');
  }

  return (
    <div className="container-width mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Edit Activity
        </h1>
        <ActivityForm activity={activity} />
      </div>
    </div>
  );
} 