"use client";

import { Suspense, lazy } from "react";
import { useLanguage } from "@/context/LanguageContext";
import HeroCarousel from "@/components/features/Hero/HeroCarousel";
import LatestNews from "@/components/features/News/LatestNews";
import { TrainingProgram } from "@/types";

// Lazy load components that are not immediately visible
const LatestMatches = lazy(() => import("@/components/features/Matches/LatestMatches"));
const FeaturedPrograms = lazy(() => import("@/components/features/Training/FeaturedPrograms"));

interface HomePageClientProps {
  heroArticles: any[];
  articles: any[];
  upcomingMatches: any[];
  completedMatches: any[];
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
      <section className="w-full bg-rugby-teal/5 dark:bg-rugby-teal/10">
        <div className="container-width py-16">
          <LatestNews articles={articles} />
        </div>
      </section>

      {/* Latest Matches Section */}
      <Suspense fallback={<div className="h-48 flex items-center justify-center">Loading matches...</div>}>
        <div className="mb-16">
          <LatestMatches upcomingMatches={upcomingMatches} completedMatches={completedMatches} />
        </div>
      </Suspense>

      {/* Featured Programs */}
      <Suspense fallback={<div className="h-48 flex items-center justify-center">Loading programs...</div>}>
        <section className="container-width mb-16">
          <FeaturedPrograms programs={programs} />
        </section>
      </Suspense>
    </div>
  );
} 