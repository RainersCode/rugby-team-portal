"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exercise, ExerciseCategory } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Timer, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const exerciseTranslations = {
  en: {
    title: "Exercise Library",
    subtitle: "Explore our comprehensive collection of rugby-specific exercises and drills.",
    browseExercises: "Browse Exercises",
    viewTrainingPrograms: "View Training Programs",
    watchTutorial: "Watch Tutorial",
    readMore: "Read More",
    readLess: "Read Less",
    categories: {
      weightlifting: "Weightlifting",
      strength: "Strength",
      sprint: "Sprint",
      cardio: "Cardio",
      agility: "Agility",
      flexibility: "Flexibility",
      recovery: "Recovery"
    },
    difficulty: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    }
  },
  lv: {
    title: "Vingrojumu Bibliotēka",
    subtitle: "Izpētiet mūsu visaptverošo regbija vingrojumu un treniņu kolekciju.",
    browseExercises: "Pārlūkot Vingrojumus",
    viewTrainingPrograms: "Skatīt Treniņu Programmas",
    watchTutorial: "Skatīt Pamācību",
    readMore: "Lasīt Vairāk",
    readLess: "Lasīt Mazāk",
    categories: {
      weightlifting: "Svarcelšana",
      strength: "Spēks",
      sprint: "Sprints",
      cardio: "Kardio",
      agility: "Veiklība",
      flexibility: "Lokanība",
      recovery: "Atjaunošanās"
    },
    difficulty: {
      beginner: "Iesācējs",
      intermediate: "Vidējs",
      advanced: "Augsts"
    }
  }
};

interface ExercisesPageClientProps {
  groupedExercises: Record<ExerciseCategory, Exercise[]>;
}

export default function ExercisesPageClient({ groupedExercises }: ExercisesPageClientProps) {
  const { language } = useLanguage();
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = (exerciseId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const truncateDescription = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
            {exerciseTranslations[language].title}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {exerciseTranslations[language].subtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {exerciseTranslations[language].browseExercises}
          </h2>
          <Link 
            href="/training" 
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            {exerciseTranslations[language].viewTrainingPrograms} →
          </Link>
        </div>

        <Tabs defaultValue={categoryOrder[0]} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 mb-12">
            {categoryOrder.map((category) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="capitalize data-[state=active]:bg-rugby-teal data-[state=active]:text-white"
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {exerciseTranslations[language].categories[category]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoryOrder.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(groupedExercises[category] || []).map((exercise) => (
                  <Card 
                    key={exercise.id} 
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-rugby-teal/20 hover:border-rugby-teal"
                  >
                    {/* Exercise Image */}
                    {exercise.image_url && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={exercise.image_url}
                          alt={exercise.name}
                          fill
                          className="object-cover transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                        <Badge 
                          className={`absolute top-4 right-4 capitalize ${
                            exercise.difficulty === 'beginner' ? 'bg-rugby-teal text-white hover:bg-rugby-teal/90' :
                            exercise.difficulty === 'intermediate' ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20' :
                            'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20'
                          }`}
                        >
                          {exerciseTranslations[language].difficulty[exercise.difficulty]}
                        </Badge>
                      </div>
                    )}

                    {/* Exercise Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-rugby-teal transition-colors">
                        {exercise.name}
                      </h3>
                      <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        <p>
                          {expandedDescriptions[exercise.id] 
                            ? exercise.description 
                            : truncateDescription(exercise.description)}
                        </p>
                        {exercise.description.length > 100 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDescription(exercise.id);
                            }}
                            className="mt-3 text-white bg-rugby-teal hover:bg-rugby-teal/80 rounded-none px-4 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors duration-200 shadow-sm"
                          >
                            {expandedDescriptions[exercise.id] 
                              ? <>
                                  {exerciseTranslations[language].readLess}
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              : <>
                                  {exerciseTranslations[language].readMore}
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                            }
                          </Button>
                        )}
                      </div>

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
                            {exerciseTranslations[language].watchTutorial}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Hover effect line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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