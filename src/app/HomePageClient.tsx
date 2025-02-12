"use client";

import { Suspense, lazy } from "react";
import { useLanguage } from "@/context/LanguageContext";
import HeroCarousel from "@/components/features/Hero/HeroCarousel";
import LatestNews from "@/components/features/News/LatestNews";
import { TrainingProgram, Article, Match } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChevronRight } from "lucide-react";

// Lazy load components that are not immediately visible
const LatestMatches = lazy(() => import("@/components/features/Matches/LatestMatches"));

interface HomePageClientProps {
  heroArticles: Article[];
  articles: Article[];
  upcomingMatches: Match[];
  completedMatches: Match[];
  programs: TrainingProgram[];
}

export default function HomePageClient({
  heroArticles,
  articles,
  upcomingMatches,
  completedMatches,
  programs,
}: HomePageClientProps) {
  const { translations } = useLanguage();

  return (
    <div className="space-y-0 pb-12">
      {/* Hero Carousel */}
      <div>
        <HeroCarousel articles={heroArticles} nextMatch={upcomingMatches[0]} />
      </div>

      {/* News Grid Section */}
      <LatestNews articles={articles} />

      {/* Latest Matches Section */}
      <Suspense fallback={<div className="h-48 flex items-center justify-center">Loading matches...</div>}>
        <div className="mb-16">
          <LatestMatches upcomingMatches={upcomingMatches} completedMatches={completedMatches} />
        </div>
      </Suspense>

      {/* Training */}
      {programs.length > 0 && (
        <section className="w-full bg-rugby-teal/5 dark:bg-rugby-teal/10">
          <div className="container-width py-12 px-2 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {translations.training}
              </h2>
              <Link 
                href="/training" 
                className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
              >
                {translations.viewAll} {translations.training.toLowerCase()} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Link key={program.id} href={`/training/${program.id}`}>
                  <Card className="group relative flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-rugby-teal/20 hover:border-rugby-teal bg-white dark:bg-gray-800">
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
                          className={`absolute top-4 right-4 capitalize ${
                            program.difficulty === 'beginner' ? 'bg-rugby-teal text-white hover:bg-rugby-teal/90' :
                            program.difficulty === 'intermediate' ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20' :
                            'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20'
                          }`}
                        >
                          {program.difficulty}
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
                            {program.duration} {translations.weeks}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-rugby-red" />
                          <span>{program.difficulty}</span>
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
      )}

      {/* Call to Action Section */}
      <section className="relative py-12 sm:py-24 bg-rugby-teal/60 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/fnx banner png.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.9
          }}
        />
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 z-0 bg-black/20">
          <div className="absolute transform -rotate-45 -left-1/4 -top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 z-10">
          {/* Text Content */}
          <div className="flex-1 text-white text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
              Join Our Rugby Family
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 drop-shadow-lg">
              Be part of something special. Train with the best, play with
              passion, and create lasting memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
              <a
                href="/join"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-rugby-teal transition-all hover:bg-white/90 hover:scale-105 min-w-[160px] sm:min-w-[200px]"
              >
                Join Now
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-transparent border-2 border-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition-all hover:bg-white/10 hover:scale-105 min-w-[160px] sm:min-w-[200px]"
              >
                Contact Us
              </a>
            </div>
          </div>
          {/* Right side space for visual balance */}
          <div className="flex-1 lg:flex-none lg:w-1/3"></div>
        </div>
      </section>
    </div>
  );
} 