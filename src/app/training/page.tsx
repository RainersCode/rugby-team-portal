import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Clock, Users, ChevronRight } from 'lucide-react';
import { TrainingProgram } from '@/types';

export const dynamic = 'force-dynamic';

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
            Training Programs
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Elevate your game with our structured training programs designed for all skill levels.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Available Programs
          </h2>
          <Link 
            href="/training/exercises" 
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            View Exercise Library →
          </Link>
        </div>

        <div className="space-y-12">
          {difficultyOrder.map((difficulty) => {
            const programsInCategory = groupedPrograms[difficulty] || [];
            if (programsInCategory.length === 0) return null;

            return (
              <section key={difficulty} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {difficulty} Programs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programsInCategory.map((program) => (
                    <Link key={program.id} href={`/training/${program.id}`}>
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-rugby-teal/20">
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
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-rugby-teal transition-colors">
                            {program.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                            {program.description}
                          </p>

                          {/* Program Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-rugby-teal" />
                              <span>{program.duration_weeks} weeks</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Dumbbell className="w-4 h-4 text-rugby-red" />
                              <span>3-5 workouts/week</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-rugby-yellow" />
                              <span>{program.target_audience}</span>
                            </div>
                          </div>

                          {/* View Program Button */}
                          <div className="mt-4 flex justify-end">
                            <div className="group inline-flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium">
                              View Program
                              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
} 