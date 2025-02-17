'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Dumbbell, ChevronRight } from 'lucide-react';
import { TrainingProgram } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface FeaturedProgramsProps {
  programs: TrainingProgram[];
}

export default function FeaturedPrograms({ programs }: FeaturedProgramsProps) {
  const { translations } = useLanguage();

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-rugby-teal text-white hover:bg-rugby-teal/90';
      case 'intermediate':
        return 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20';
      case 'advanced':
        return 'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getDifficultyTranslation = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return translations.beginner;
      case 'intermediate':
        return translations.intermediate;
      case 'advanced':
        return translations.advanced;
      default:
        return difficulty;
    }
  };

  return (
    <section className="bg-rugby-teal/5 dark:bg-rugby-teal/10">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Training Programs
          </h2>
          <Link 
            href="/training" 
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            View all programs →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Link key={program.id} href={`/training/${program.id}`}>
              <Card className="group relative bg-gradient-to-br from-card-bg-light to-card-bg-light/95 dark:from-card-bg-dark dark:to-card-bg-dark/95 flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-rugby-teal/20 hover:border-rugby-teal">
                {/* Program Image Container */}
                <div className="relative w-full pt-[50%] overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={program.image_url || 'https://placehold.co/600x400/1a365d/ffffff?text=Training+Program'}
                        alt={program.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <Badge 
                      className={`absolute top-4 right-4 capitalize ${getDifficultyStyle(program.difficulty)}`}
                    >
                      {getDifficultyTranslation(program.difficulty)}
                    </Badge>
                  </div>
                </div>

                {/* Program Info */}
                <div className="relative flex-1 p-6">
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
                      <span>
                        {program.duration_weeks} {translations.weeks}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-rugby-red" />
                      <span>{program.target_audience}</span>
                    </div>
                  </div>

                  {/* View Program Button */}
                  <div className="mt-4 flex justify-end">
                    <div className="group inline-flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium">
                      {translations.viewProgram}
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 