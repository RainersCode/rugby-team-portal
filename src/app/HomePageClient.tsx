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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChevronRight } from "lucide-react";
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
      <div className="mb-16">
        <LatestMatches
          upcomingMatches={upcomingMatches}
          completedMatches={completedMatches}
        />
      </div>

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

      {/* Training */}
      {programs.length > 0 && (
        <section className="w-full bg-rugby-teal/5 dark:bg-rugby-teal/10">
          <div className="container-width py-16">
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
      )}

      {/* Twitter Feed Section */}
      <section className="w-full bg-white dark:bg-gray-900">
        <div className="container-width py-16">
          <div className="flex flex-col mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {translations.rugbyUpdates}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {translations.rugbyUpdatesSubheading}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
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
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="w-full bg-rugby-teal/5 dark:bg-rugby-teal/10">
        <div className="container-width py-16">
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
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="w-full bg-white dark:bg-gray-900">
        <div className="container-width py-16">
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
                className="relative w-48 h-24 bg-gray-300 dark:bg-gray-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-rugby-teal/30 hover:bg-rugby-teal/5"
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