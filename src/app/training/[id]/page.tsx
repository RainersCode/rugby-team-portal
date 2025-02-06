import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dumbbell, 
  Clock, 
  Users, 
  Calendar,
  Timer,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { TrainingProgram, ProgramWorkout, WorkoutExercise } from '@/types';

export const dynamic = 'force-dynamic';

async function getProgram(id: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: program, error } = await supabase
    .from('training_programs')
    .select(`
      *,
      author:author_id (
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !program) {
    return null;
  }

  return program as TrainingProgram;
}

async function getProgramWorkouts(programId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: workouts } = await supabase
    .from('program_workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise (
          *
        )
      )
    `)
    .eq('program_id', programId)
    .order('week_number', { ascending: true })
    .order('day_number', { ascending: true });

  return workouts || [];
}

export default async function ProgramPage({
  params
}: {
  params: { id: string }
}) {
  const program = await getProgram(params.id);
  if (!program) {
    notFound();
  }

  const workouts = await getProgramWorkouts(params.id);

  // Group workouts by week
  const workoutsByWeek = workouts.reduce((acc, workout) => {
    if (!acc[workout.week_number]) {
      acc[workout.week_number] = [];
    }
    acc[workout.week_number].push(workout);
    return acc;
  }, {} as Record<number, (ProgramWorkout & { workout_exercises: (WorkoutExercise & { exercise: any })[] })[]]); 

  return (
    <div className="container-width mx-auto px-4 py-8">
      {/* Program Header */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-8">
        <Image
          src={program.image_url || '/images/default-program.jpg'}
          alt={program.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Badge 
            className="mb-4 capitalize"
            variant={
              program.difficulty === 'beginner' ? 'default' :
              program.difficulty === 'intermediate' ? 'secondary' :
              program.difficulty === 'advanced' ? 'destructive' :
              'outline'
            }
          >
            {program.difficulty}
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            {program.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{program.duration_weeks} weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              <span>3-5 workouts/week</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{program.target_audience}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Description */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          About This Program
        </h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {program.description}
        </p>
      </div>

      {/* Program Workouts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Training Schedule
        </h2>

        <Tabs defaultValue="1" className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 mb-8">
            {Object.keys(workoutsByWeek).map((week) => (
              <TabsTrigger 
                key={week} 
                value={week}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Week {week}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(workoutsByWeek).map(([week, workouts]) => (
            <TabsContent key={week} value={week}>
              <div className="space-y-6">
                {workouts.map((workout) => (
                  <Card key={workout.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {workout.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            <span>{workout.duration_minutes} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Day {workout.day_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {workout.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                        {workout.description}
                      </p>
                    )}

                    {/* Exercises */}
                    <div className="space-y-4">
                      {workout.workout_exercises
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((workoutExercise) => (
                          <div 
                            key={workoutExercise.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          >
                            {/* Exercise Image */}
                            {workoutExercise.exercise.image_url && (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={workoutExercise.exercise.image_url}
                                  alt={workoutExercise.exercise.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Exercise Info */}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {workoutExercise.exercise.name}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                {workoutExercise.sets && (
                                  <span>{workoutExercise.sets} sets</span>
                                )}
                                {workoutExercise.reps && (
                                  <>
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{workoutExercise.reps} reps</span>
                                  </>
                                )}
                                {workoutExercise.duration_seconds && (
                                  <>
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{workoutExercise.duration_seconds}s</span>
                                  </>
                                )}
                                {workoutExercise.rest_seconds && (
                                  <>
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{workoutExercise.rest_seconds}s rest</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Video Tutorial */}
                            {workoutExercise.exercise.video_url && (
                              <Link
                                href={workoutExercise.exercise.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 p-2 text-primary-blue hover:text-primary-blue/80"
                              >
                                <RotateCcw className="w-5 h-5" />
                              </Link>
                            )}
                          </div>
                        ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
} 