import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Dumbbell, ChevronRight } from 'lucide-react';
import { TrainingProgram } from '@/types';

interface FeaturedProgramsProps {
  programs: TrainingProgram[];
}

export default function FeaturedPrograms({ programs }: FeaturedProgramsProps) {
  return (
    <section className="bg-gray-50 dark:bg-gray-800/50">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Training Programs
          </h2>
          <Link 
            href="/training" 
            className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
          >
            View all programs →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
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
                      program.difficulty === 'beginner' ? 'default' :
                      program.difficulty === 'intermediate' ? 'secondary' :
                      program.difficulty === 'advanced' ? 'destructive' :
                      'outline'
                    }
                  >
                    {program.difficulty}
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
      </div>
    </section>
  );
} 