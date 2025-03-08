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
  Video,
  ChevronDown,
  ChevronUp
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
  
  // Group workouts by week - MOVED UP before useState
  const workoutsByWeek = workouts.reduce<Record<number, ProgramWorkout[]>>((acc, workout) => {
    if (!acc[workout.week_number]) {
      acc[workout.week_number] = [];
    }
    acc[workout.week_number].push(workout);
    return acc;
  }, {});
  
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [activeWeek, setActiveWeek] = useState<string>(
    Object.keys(workoutsByWeek).length > 0 ? Object.keys(workoutsByWeek)[0] : "1"
  );

  const toggleDescription = (exerciseId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  return (
    <div className="container-width mx-auto px-4 py-6 md:py-8">
      {/* Program Header - Improved for mobile */}
      <div className="relative h-48 md:h-64 rounded-none overflow-hidden mb-6 md:mb-8 shadow-md">
        <Image
          src={program.image_url || 'https://placehold.co/600x400/1a365d/ffffff?text=Training+Program'}
          alt={program.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
          <Badge 
            className={`mb-2 md:mb-4 capitalize rounded-none ${
              program.difficulty === 'beginner' ? 'bg-rugby-teal text-white hover:bg-rugby-teal/90' :
              program.difficulty === 'intermediate' ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20' :
              'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20'
            }`}
          >
            {t.difficulty[program.difficulty]}
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {program.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-gray-200 text-sm md:text-base">
            <div className="flex items-center gap-1 md:gap-2">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>{program.duration_weeks} {language === 'en' ? 'weeks' : 'nedēļas'}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Dumbbell className="w-3 h-3 md:w-4 md:h-4" />
              <span>3-5 {t.workoutsPerWeek}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span>{program.target_audience}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Program Description */}
      <Card className="p-4 md:p-6 mb-6 md:mb-12 rounded-none border-rugby-teal/20">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
          {t.aboutProgram}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm md:text-base">
          {program.description}
        </p>
      </Card>

      {/* Program Workouts */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
          {t.trainingSchedule}
        </h2>

        {Object.keys(workoutsByWeek).length > 0 ? (
          <Tabs 
            defaultValue={Object.keys(workoutsByWeek)[0]} 
            className="w-full"
            value={activeWeek}
            onValueChange={setActiveWeek}
          >
            {/* Mobile Week Selector */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-none">
                <span className="font-medium">{t.week} {activeWeek}</span>
                <select 
                  value={activeWeek}
                  onChange={(e) => setActiveWeek(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-none px-2 py-1"
                >
                  {Object.keys(workoutsByWeek).map((week) => (
                    <option key={week} value={week}>
                      {t.week} {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop Week Tabs */}
            <TabsList className="hidden md:flex w-full flex-wrap gap-2 mb-8">
              {Object.keys(workoutsByWeek).map((week) => (
                <TabsTrigger 
                  key={week} 
                  value={week}
                  className="gap-2 rounded-none data-[state=active]:bg-rugby-teal data-[state=active]:text-white"
                >
                  <Calendar className="w-4 h-4" />
                  {t.week} {week}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(workoutsByWeek).map(([week, workouts]) => (
              <TabsContent key={week} value={week}>
                <div className="space-y-4 md:space-y-6">
                  {workouts.map((workout) => (
                    <Card key={workout.id} className="p-4 md:p-6 rounded-none border-rugby-teal/20">
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {workout.title}
                          </h3>
                          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Timer className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{workout.duration_minutes} {t.minutes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                              <span>{t.day} {workout.day_number}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {workout.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mb-4 md:mb-6">
                          {workout.description}
                        </p>
                      )}

                      {/* Exercises */}
                      <div className="space-y-3 md:space-y-4">
                        {workout.workout_exercises?.map((workoutExercise) => (
                          <div 
                            key={workoutExercise.id}
                            className="p-3 md:p-4 rounded-none bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors border border-gray-200 dark:border-gray-700"
                          >
                            {/* Exercise Header - Image, Title and Video Button */}
                            <div className="flex items-center gap-3">
                              {/* Exercise Image */}
                              {workoutExercise.exercise?.image_url && (
                                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-none overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                  <Image
                                    src={workoutExercise.exercise.image_url}
                                    alt={workoutExercise.exercise.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              {/* Exercise Title and Video Button */}
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-base md:text-lg">
                                  {workoutExercise.exercise?.name}
                                </h4>
                                
                                {/* Video Tutorial Button */}
                                {workoutExercise.exercise?.video_url && (
                                  <Link
                                    href={workoutExercise.exercise.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-1 text-xs md:text-sm text-rugby-teal hover:text-rugby-teal/80"
                                  >
                                    <Video className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>{t.watchTutorial}</span>
                                  </Link>
                                )}
                              </div>
                            </div>
                            
                            {/* Exercise Badges - Full width on mobile */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              {workoutExercise.sets && (
                                <Badge className="bg-rugby-teal text-white hover:bg-rugby-teal/90 px-2 py-0.5 text-xs rounded-none">
                                  {workoutExercise.sets} {t.sets}
                                </Badge>
                              )}
                              {workoutExercise.reps && (
                                <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-2 py-0.5 text-xs rounded-none">
                                  {workoutExercise.reps} {t.reps}
                                </Badge>
                              )}
                              {workoutExercise.duration_seconds && (
                                <Badge className="bg-rugby-red text-white hover:bg-rugby-red/90 px-2 py-0.5 text-xs rounded-none">
                                  {workoutExercise.duration_seconds}s
                                </Badge>
                              )}
                              {workoutExercise.rest_seconds && (
                                <Badge className="bg-gray-600 text-white hover:bg-gray-700 px-2 py-0.5 text-xs rounded-none">
                                  {workoutExercise.rest_seconds}s {t.rest}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Description with Show More/Less */}
                            {workoutExercise.exercise?.description && (
                              <div className="mt-3">
                                <div className="p-2 md:p-3 bg-white dark:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-700">
                                  <p className={`text-xs md:text-sm text-gray-600 dark:text-gray-300 ${!expandedDescriptions[workoutExercise.id] ? 'line-clamp-2' : ''}`}>
                                    {workoutExercise.exercise.description}
                                  </p>
                                  <button
                                    onClick={() => toggleDescription(workoutExercise.id)}
                                    className="flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 text-xs md:text-sm mt-1 font-medium"
                                  >
                                    {expandedDescriptions[workoutExercise.id] ? (
                                      <>
                                        {t.showLess}
                                        <ChevronUp className="w-3 h-3" />
                                      </>
                                    ) : (
                                      <>
                                        {t.showMore}
                                        <ChevronDown className="w-3 h-3" />
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
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
          <Card className="p-4 md:p-6 text-center text-gray-500 rounded-none">
            {t.noWorkouts}
          </Card>
        )}
      </div>
    </div>
  );
} 