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
  RotateCcw,
  Play,
  Video
} from 'lucide-react';
import { TrainingProgram, ProgramWorkout, WorkoutExercise } from '@/types';
import { Metadata } from 'next';

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

  // Group workouts by week
  const workoutsByWeek = workouts.reduce<Record<number, ProgramWorkout[]>>((acc, workout) => {
    if (!acc[workout.week_number]) {
      acc[workout.week_number] = [];
    }
    acc[workout.week_number].push(workout);
    return acc;
  }, {});

  return (
    <div className="container-width mx-auto px-4 py-8">
      {/* Program Header */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-8">
        <Image
          src={program.image_url || 'https://placehold.co/600x400/1a365d/ffffff?text=Training+Program'}
          alt={program.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Badge 
            className={`mb-4 capitalize ${
              program.difficulty === 'beginner' ? 'bg-rugby-teal text-white hover:bg-rugby-teal/90' :
              program.difficulty === 'intermediate' ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20' :
              'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20'
            }`}
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

        {Object.keys(workoutsByWeek).length > 0 ? (
          <Tabs defaultValue={Object.keys(workoutsByWeek)[0]} className="w-full">
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
                        {workout.workout_exercises?.map((workoutExercise) => (
                          <div 
                            key={workoutExercise.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors mb-3"
                          >
                            {/* Exercise Image */}
                            {workoutExercise.exercise?.image_url && (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={workoutExercise.exercise.image_url}
                                  alt={workoutExercise.exercise.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Exercise Info */}
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                                {workoutExercise.exercise?.name}
                              </h4>
                              <div className="flex items-center flex-wrap gap-3 text-sm mt-2">
                                {workoutExercise.sets && (
                                  <Badge className="bg-rugby-teal text-white hover:bg-rugby-teal/90 px-3 py-1 text-base">
                                    {workoutExercise.sets} sets
                                  </Badge>
                                )}
                                {workoutExercise.reps && (
                                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-3 py-1 text-base">
                                    {workoutExercise.reps} reps
                                  </Badge>
                                )}
                                {workoutExercise.duration_seconds && (
                                  <Badge className="bg-rugby-red text-white hover:bg-rugby-red/90 px-3 py-1 text-base">
                                    {workoutExercise.duration_seconds}s
                                  </Badge>
                                )}
                                {workoutExercise.rest_seconds && (
                                  <Badge className="bg-gray-600 text-white hover:bg-gray-700 px-3 py-1 text-base">
                                    {workoutExercise.rest_seconds}s rest
                                  </Badge>
                                )}
                              </div>
                              
                              {workoutExercise.exercise?.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                  {workoutExercise.exercise.description}
                                </p>
                              )}
                            </div>

                            {/* Video Tutorial Button */}
                            {workoutExercise.exercise?.video_url && (
                              <Link
                                href={workoutExercise.exercise.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-rugby-teal text-white hover:bg-rugby-teal/90 transition-colors"
                              >
                                <Video className="w-4 h-4" />
                                <span className="hidden sm:inline">Watch Tutorial</span>
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
        ) : (
          <Card className="p-6 text-center text-gray-500">
            No workouts have been added to this program yet.
          </Card>
        )}
      </div>
    </div>
  );
} 