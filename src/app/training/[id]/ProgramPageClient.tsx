"use client";

import { useState } from 'react';
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
  Video
} from 'lucide-react';
import { TrainingProgram, ProgramWorkout } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const programTranslations = {
  en: {
    aboutProgram: "About This Program",
    trainingSchedule: "Training Schedule",
    noWorkouts: "No workouts have been added to this program yet.",
    week: "Week",
    day: "Day",
    minutes: "minutes",
    sets: "sets",
    reps: "reps",
    rest: "rest",
    watchTutorial: "Watch Tutorial",
    workoutsPerWeek: "workouts/week",
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    },
    showMore: "Show More",
    showLess: "Show Less",
  },
  lv: {
    aboutProgram: "Par Šo Programmu",
    trainingSchedule: "Treniņu Grafiks",
    noWorkouts: "Šai programmai vēl nav pievienoti treniņi.",
    week: "Nedēļa",
    day: "Diena",
    minutes: "minūtes",
    sets: "piegājieni",
    reps: "atkārtojumi",
    rest: "atpūta",
    watchTutorial: "Skatīt Pamācību",
    workoutsPerWeek: "treniņi/nedēļā",
    difficulty: {
      beginner: "Iesācējs",
      intermediate: "Vidējs",
      advanced: "Augsts"
    },
    showMore: "Rādīt Vairāk",
    showLess: "Rādīt Mazāk",
  }
};

interface ProgramPageClientProps {
  program: TrainingProgram;
  workouts: ProgramWorkout[];
}

export default function ProgramPageClient({ program, workouts }: ProgramPageClientProps) {
  const { language } = useLanguage();
  const t = programTranslations[language];
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = (exerciseId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

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
        <div className="absolute bottom-6 left-6 right-6">
          <Badge 
            className={`mb-4 capitalize ${
              program.difficulty === 'beginner' ? 'bg-rugby-teal text-white hover:bg-rugby-teal/90' :
              program.difficulty === 'intermediate' ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20' :
              'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20'
            }`}
          >
            {t.difficulty[program.difficulty]}
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            {program.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{program.duration_weeks} {language === 'en' ? 'weeks' : 'nedēļas'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              <span>3-5 {t.workoutsPerWeek}</span>
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
          {t.aboutProgram}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
          {program.description}
        </p>
      </div>

      {/* Program Workouts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t.trainingSchedule}
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
                  {t.week} {week}
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
                              <span>{workout.duration_minutes} {t.minutes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{t.day} {workout.day_number}</span>
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
                            className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
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
                              <div className="flex items-center flex-wrap gap-2 text-sm mt-2">
                                {workoutExercise.sets && (
                                  <Badge className="bg-rugby-teal text-white hover:bg-rugby-teal/90 px-2 py-0.5 text-sm sm:text-base sm:px-3 sm:py-1">
                                    {workoutExercise.sets} {t.sets}
                                  </Badge>
                                )}
                                {workoutExercise.reps && (
                                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-2 py-0.5 text-sm sm:text-base sm:px-3 sm:py-1">
                                    {workoutExercise.reps} {t.reps}
                                  </Badge>
                                )}
                                {workoutExercise.duration_seconds && (
                                  <Badge className="bg-rugby-red text-white hover:bg-rugby-red/90 px-2 py-0.5 text-sm sm:text-base sm:px-3 sm:py-1">
                                    {workoutExercise.duration_seconds}s
                                  </Badge>
                                )}
                                {workoutExercise.rest_seconds && (
                                  <Badge className="bg-gray-600 text-white hover:bg-gray-700 px-2 py-0.5 text-sm sm:text-base sm:px-3 sm:py-1">
                                    {workoutExercise.rest_seconds}s {t.rest}
                                  </Badge>
                                )}
                              </div>
                              
                              {workoutExercise.exercise?.description && (
                                <div className="mt-2">
                                  <p className={`text-sm text-gray-600 dark:text-gray-300 ${!expandedDescriptions[workoutExercise.id] ? 'line-clamp-2' : ''}`}>
                                    {workoutExercise.exercise.description}
                                  </p>
                                  <button
                                    onClick={() => toggleDescription(workoutExercise.id)}
                                    className="text-rugby-teal hover:text-rugby-teal/80 text-sm mt-1 font-medium"
                                  >
                                    {expandedDescriptions[workoutExercise.id] ? t.showLess : t.showMore}
                                  </button>
                                </div>
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
                                <span className="hidden sm:inline">{t.watchTutorial}</span>
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
            {t.noWorkouts}
          </Card>
        )}
      </div>
    </div>
  );
} 