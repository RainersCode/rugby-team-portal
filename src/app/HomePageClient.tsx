"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import LatestMatches from "@/components/features/Matches/LatestMatches";
import LatestNews from "@/components/features/News/LatestNews";
import HeroCarousel from "@/components/features/Hero/HeroCarousel";
import InstagramFeed from "@/components/features/Instagram/InstagramFeed";
import TwitterFeed from "@/components/features/Twitter/TwitterFeed";
import FeaturedPrograms from "@/components/features/Training/FeaturedPrograms";
import { Button } from "@/components/ui/button";
import { TrainingProgram } from "@/types";

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
    <div className="space-y-12 pb-12">
      {/* Hero Carousel */}
      <HeroCarousel articles={heroArticles} nextMatch={upcomingMatches[0]} />

      {/* News Grid Section */}
      <LatestNews articles={articles} />

      {/* Latest Matches Section */}
      <LatestMatches
        upcomingMatches={upcomingMatches}
        completedMatches={completedMatches}
      />

      {/* Call to Action Section */}
      <section className="relative py-24 bg-rugby-teal/60 overflow-hidden">
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
        <div className="absolute inset-0 opacity-5 z-0 bg-black/20"></div>

        <div className="relative container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
          {/* Text Content */}
          <div className="flex-1 text-white text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 drop-shadow-lg">
              {translations.joinOurFamily}
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 drop-shadow-lg">
              {translations.joinSubheading}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button 
                href="/contact"
                variant="primary"
                size="lg"
                className="bg-white text-rugby-teal hover:bg-white/90"
              >
                {translations.getStarted}
              </Button>
              <Button 
                href="/activities"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-rugby-teal"
              >
                {translations.viewSchedule}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Training Programs */}
      {programs.length > 0 && (
        <section className="container-width">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {translations.featuredPrograms}
            </h2>
            <Link
              href="/training"
              className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
            >
              {translations.viewAll} {translations.training.toLowerCase()} →
            </Link>
          </div>
          <FeaturedPrograms programs={programs} />
        </section>
      )}

      {/* Twitter Feed Section */}
      <section className="container-width">
        <div className="flex flex-col mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {translations.rugbyUpdates}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {translations.rugbyUpdatesSubheading}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-lg">
          <TwitterFeed
            usernames={[
              // International Rugby
              { username: "WorldRugby", category: "International Rugby" },
              { username: "SixNationsRugby", category: "International Rugby" },
              { username: "rugbyworldcup", category: "International Rugby" },
              { username: "RugbyEurope", category: "International Rugby" },

              // Major Leagues & Tournaments
              { username: "ChampionsCup", category: "Major Leagues" },
              { username: "premrugby", category: "Major Leagues" },
              { username: "URC", category: "Major Leagues" },
              { username: "top14rugby", category: "Major Leagues" },

              // News & Analysis
              { username: "RugbyPass", category: "News & Analysis" },
              { username: "TheRugbyPaper", category: "News & Analysis" },
              { username: "RugbyInsideLine", category: "News & Analysis" },
              { username: "RugbyWorldMag", category: "News & Analysis" },

              // National Teams
              { username: "EnglandRugby", category: "National Teams" },
              { username: "WelshRugbyUnion", category: "National Teams" },
              { username: "IrishRugby", category: "National Teams" },
              { username: "FranceRugby", category: "National Teams" },
            ]}
          />
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="container-width">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {translations.followInstagram}
          </h2>
          <a
            href="https://instagram.com/your_rugby_team"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
          >
            {translations.yourTeamHandle} →
          </a>
        </div>
        <InstagramFeed />
      </section>

      {/* Sponsors Section */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {translations.ourSponsors}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {translations.sponsorsSubheading}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div
                key={num}
                className="relative w-48 h-24 bg-rugby-teal/40 dark:bg-rugby-teal/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-rugby-teal/30 hover:bg-rugby-teal/50 dark:hover:bg-rugby-teal/60"
              >
                <Image
                  src={`/logo/${num === 1 ? "Sponsor" : "Sponsoru"}_logo_${num}-removebg-preview.png`}
                  alt={`${translations.ourSponsors} ${num}`}
                  fill
                  className="object-contain filter hover:brightness-110 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 