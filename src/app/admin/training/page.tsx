import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Exercise, TrainingProgram } from '@/types';
import ExerciseList from '@/components/features/Training/Admin/ExerciseList';
import ProgramList from '@/components/features/Training/Admin/ProgramList';

export const dynamic = 'force-dynamic';

export default async function AdminTrainingPage() {
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

  // Fetch exercises
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  // Fetch training programs
  const { data: programsData, error: programsError } = await supabase
    .from('training_programs_with_authors')
    .select('*')
    .order('created_at', { ascending: false });

  // Transform the programs data to include the author field
  const programs = programsData?.map(program => ({
    ...program,
    author: program.author_email ? { email: program.author_email } : null
  })) || [];

  return (
    <div className="container-width mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Training Management
        </h1>
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="programs">Training Programs</TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <Link href="/admin/training/exercises/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Exercise
              </Button>
            </Link>
            <Link href="/admin/training/programs/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Program
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="exercises">
          <ExerciseList exercises={exercises as Exercise[] || []} />
        </TabsContent>

        <TabsContent value="programs">
          <ProgramList programs={programs as TrainingProgram[] || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 