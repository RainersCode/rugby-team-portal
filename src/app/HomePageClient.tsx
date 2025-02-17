"use client";

import { Suspense, lazy } from "react";
import { useLanguage } from "@/context/LanguageContext";
import HeroCarousel from "@/components/features/Hero/HeroCarousel";
import LatestNews from "@/components/features/News/LatestNews";
import { TrainingProgram, Article, Match, Player } from "@/types";
import MatchList from "@/components/features/Matches/MatchList";
import TrainingList from "@/components/features/Training/TrainingList";
import TeamSection from "@/components/features/Team/TeamSection";
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
  players: Player[];
}

export default function HomePageClient({
  heroArticles,
  articles,
  upcomingMatches,
  completedMatches,
  programs,
  players,
}: HomePageClientProps) {
  const { translations } = useLanguage();

  return (
    <div className="space-y-0">
      {/* Hero Carousel */}
      <div>
        <HeroCarousel articles={heroArticles} nextMatch={upcomingMatches[0]} />
      </div>

      {/* News Grid Section */}
      <LatestNews articles={articles} />

      {/* Call to Action Section */}
      <section className="bg-rugby-teal/5 dark:bg-rugby-teal/10">
        <div className="container-width py-12">
          <div className="relative overflow-hidden rounded-2xl bg-rugby-teal/60">
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
            <div className="absolute inset-0 opacity-5 z-0 bg-black/20" />

            <div className="relative py-4 sm:py-12 px-4 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-12 z-10">
              {/* Text Content */}
              <div className="flex-1 text-white text-center lg:text-left px-4 lg:pl-8 lg:pr-12">
                <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-6 drop-shadow-lg">
                  {translations.joinOurFamily}
                </h2>
                <p className="text-sm sm:text-xl lg:text-2xl mb-3 sm:mb-8 opacity-90 drop-shadow-lg">
                  {translations.joinSubheading}
                </p>
                <div className="flex justify-center lg:justify-start">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-1.5 sm:px-6 sm:py-2.5 text-sm font-semibold text-rugby-teal transition-all hover:bg-white/90 hover:scale-105 min-w-[100px] sm:min-w-[140px]"
                  >
                    {translations.joinUs}
                  </a>
                </div>
              </div>
              {/* Right side space for visual balance */}
              <div className="flex-1 lg:flex-none lg:w-1/3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {players.length > 0 && (
        <TeamSection players={players} />
      )}

      {/* Latest Matches Section */}
      <Suspense fallback={<div className="h-48 flex items-center justify-center">Loading matches...</div>}>
        <MatchList 
          matches={[...upcomingMatches, ...completedMatches]} 
          title={translations.matches}
        />
      </Suspense>

      {/* Training Programs Section */}
      {programs.length > 0 && (
        <TrainingList 
          trainings={programs.map(program => ({
            id: program.id,
            title: program.title,
            description: program.description,
            date: new Date().toISOString(), // You might want to add an actual date field to your programs
            location: program.difficulty, // You might want to add a location field to your programs
            image: program.image_url || '/images/training-hero.jpg'
          }))}
          title={translations.training}
        />
      )}
    </div>
  );
} 