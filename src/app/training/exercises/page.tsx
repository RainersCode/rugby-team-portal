import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exercise, ExerciseCategory } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Timer, RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ExercisesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  // Group exercises by category
  const groupedExercises = (exercises || []).reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<ExerciseCategory, Exercise[]>);

  const categoryOrder: ExerciseCategory[] = [
    'weightlifting',
    'strength',
    'sprint',
    'cardio',
    'agility',
    'flexibility',
    'recovery'
  ];

  const getCategoryIcon = (category: ExerciseCategory) => {
    switch (category) {
      case 'weightlifting':
        return '🏋️‍♂️';
      case 'sprint':
        return '🏃‍♂️';
      case 'cardio':
        return '❤️';
      case 'strength':
        return '💪';
      case 'agility':
        return '⚡';
      case 'flexibility':
        return '🧘‍♂️';
      case 'recovery':
        return '🔄';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Exercise Library
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore our comprehensive collection of rugby-specific exercises and drills.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Browse Exercises
          </h2>
          <Link 
            href="/training" 
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            View Training Programs →
          </Link>
        </div>

        <Tabs defaultValue={categoryOrder[0]} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 mb-8">
            {categoryOrder.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize data-[state=active]:bg-rugby-teal data-[state=active]:text-white"
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoryOrder.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(groupedExercises[category] || []).map((exercise) => (
                  <Card 
                    key={exercise.id} 
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-rugby-teal/20"
                  >
                    {/* Exercise Image */}
                    {exercise.image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={exercise.image_url}
                          alt={exercise.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge 
                          className="absolute top-4 right-4 capitalize"
                          variant={
                            exercise.difficulty === 'beginner' ? 'default' :
                            exercise.difficulty === 'intermediate' ? 'secondary' :
                            exercise.difficulty === 'advanced' ? 'destructive' :
                            'outline'
                          }
                        >
                          {exercise.difficulty}
                        </Badge>
                      </div>
                    )}

                    {/* Exercise Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-rugby-teal transition-colors">
                        {exercise.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {exercise.description}
                      </p>

                      {/* Exercise Details */}
                      <div className="space-y-3">
                        {/* Equipment */}
                        {exercise.equipment.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-rugby-red" />
                            <div className="flex flex-wrap gap-1">
                              {exercise.equipment.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Muscles Targeted */}
                        {exercise.muscles_targeted.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-rugby-teal" />
                            <div className="flex flex-wrap gap-1">
                              {exercise.muscles_targeted.map((muscle, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-rugby-teal/20 text-rugby-teal">
                                  {muscle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Video Tutorial */}
                        {exercise.video_url && (
                          <Link 
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 text-rugby-teal hover:text-rugby-teal/80 text-sm"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Watch Tutorial
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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