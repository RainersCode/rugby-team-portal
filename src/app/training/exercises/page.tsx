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
    <div className="container-width mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Exercise Library
        </h1>
        <Link 
          href="/training" 
          className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
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
              className="capitalize"
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
                  className="overflow-hidden hover:shadow-lg transition-all duration-300"
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
                          <Dumbbell className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {exercise.equipment.map((item, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Muscles Targeted */}
                      {exercise.muscles_targeted.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {exercise.muscles_targeted.map((muscle, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
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
                          className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-blue/80 text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Watch Tutorial
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 