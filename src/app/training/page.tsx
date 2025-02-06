import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Clock, Users, ChevronRight } from 'lucide-react';
import { TrainingProgram } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainingPage() {
  const cookieStore = cookies();
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

  const difficultyOrder: TrainingProgram['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'elite'];

  return (
    <div className="container-width mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Training Programs
        </h1>
        <Link 
          href="/training/exercises" 
          className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
        >
          View Exercise Library →
        </Link>
      </div>

      <div className="space-y-12">
        {difficultyOrder.map((difficulty) => {
          const programsInCategory = groupedPrograms[difficulty] || [];
          if (programsInCategory.length === 0) return null;

          return (
            <section key={difficulty} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {difficulty} Programs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programsInCategory.map((program) => (
                  <Link key={program.id} href={`/training/${program.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Program Image */}
                      <div className="relative h-48 w-full">
                        <Image
                          src={program.image_url || 'https://placehold.co/600x400/1a365d/ffffff?text=Training+Program'}
                          alt={program.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge 
                          className="absolute top-4 right-4 capitalize"
                          variant={
                            difficulty === 'beginner' ? 'default' :
                            difficulty === 'intermediate' ? 'secondary' :
                            difficulty === 'advanced' ? 'destructive' :
                            'outline'
                          }
                        >
                          {difficulty}
                        </Badge>
                      </div>

                      {/* Program Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {program.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {program.description}
                        </p>

                        {/* Program Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{program.duration_weeks} weeks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dumbbell className="w-4 h-4" />
                            <span>3-5 workouts/week</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{program.target_audience}</span>
                          </div>
                        </div>

                        {/* View Program Button */}
                        <div className="mt-4 flex justify-end">
                          <div className="group inline-flex items-center gap-1 text-primary-blue hover:text-primary-blue/80 font-medium">
                            View Program
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
} 