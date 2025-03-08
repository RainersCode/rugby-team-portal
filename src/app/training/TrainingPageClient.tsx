"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Clock, Users, ChevronRight } from 'lucide-react';
import { TrainingProgram } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const trainingTranslations = {
  en: {
    title: "Training Programs",
    availablePrograms: "Available Programs",
    viewExerciseLibrary: "View Exercise Library",
    viewProgram: "View Program",
    weeks: "weeks",
    programLevels: {
      beginner: "Beginner Programs",
      intermediate: "Intermediate Programs",
      advanced: "Advanced Programs",
      elite: "Elite Programs"
    }
  },
  lv: {
    title: "Treniņu Programmas",
    availablePrograms: "Pieejamās Programmas",
    viewExerciseLibrary: "Skatīt Vingrojumu Bibliotēku",
    viewProgram: "Skatīt Programmu",
    weeks: "nedēļas",
    programLevels: {
      beginner: "Iesācēju Programmas",
      intermediate: "Vidējā Līmeņa Programmas",
      advanced: "Augsta Līmeņa Programmas",
      elite: "Elites Programmas"
    }
  }
};

interface TrainingPageClientProps {
  groupedPrograms: Record<string, TrainingProgram[]>;
}

export default function TrainingPageClient({ groupedPrograms }: TrainingPageClientProps) {
  const { language } = useLanguage();
  const difficultyOrder: TrainingProgram['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'elite'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container-width text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {trainingTranslations[language].title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {trainingTranslations[language].availablePrograms}
          </h2>
          <Link 
            href="/training/exercises" 
            className="text-rugby-red hover:text-rugby-red/80 font-medium transition-colors"
          >
            {trainingTranslations[language].viewExerciseLibrary} →
          </Link>
        </div>

        <div className="space-y-12">
          {difficultyOrder.map((difficulty) => {
            const programsInCategory = groupedPrograms[difficulty] || [];
            if (programsInCategory.length === 0) return null;

            return (
              <section key={difficulty} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {trainingTranslations[language].programLevels[difficulty]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programsInCategory.map((program) => (
                    <Link key={program.id} href={`/training/${program.id}`}>
                      <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-rugby-teal/20">
                        {/* Program Image */}
                        <div className="relative h-48 w-full">
                          <Image
                            src={program.image_url || 'https://placehold.co/600x400/1a365d/ffffff?text=Training+Program'}
                            alt={program.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Base overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Hover overlay - separate element for stronger effect */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <Badge 
                            className={`absolute top-4 right-4 capitalize ${
                              program.difficulty === 'beginner' ? 'bg-rugby-teal text-white hover:bg-rugby-teal/90' :
                              program.difficulty === 'intermediate' ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20' :
                              'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20'
                            }`}
                          >
                            {program.difficulty}
                          </Badge>
                        </div>

                        {/* Program Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-rugby-red transition-colors">
                            {program.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                            {program.description}
                          </p>

                          {/* Program Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-rugby-yellow" />
                              <span>{program.duration_weeks} {trainingTranslations[language].weeks}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-rugby-red" />
                              <span>{program.target_audience}</span>
                            </div>
                          </div>

                          {/* View Program Button */}
                          <div className="mt-4 flex justify-end">
                            <div className="group inline-flex items-center gap-1 text-rugby-red hover:text-rugby-red/80 font-medium">
                              {trainingTranslations[language].viewProgram}
                              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Hover effect line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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