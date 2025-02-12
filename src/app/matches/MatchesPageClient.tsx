"use client";

import { Match } from "@/types";
import MatchCard from "@/components/features/Matches/MatchCard";
import { useLanguage } from "@/context/LanguageContext";

const matchTranslations = {
  en: {
    title: "Match Schedule",
    subtitle: "Follow our team's journey through the season. View upcoming fixtures and past results.",
    error: "Error fetching matches. Please try again later.",
    upcomingMatches: "Upcoming Matches",
    noUpcomingMatches: "No upcoming matches scheduled.",
    pastMatches: "Past Matches",
    noPastMatches: "No past matches available."
  },
  lv: {
    title: "Spēļu Grafiks",
    subtitle: "Sekojiet līdzi mūsu komandas ceļojumam sezonas laikā. Skatiet gaidāmās spēles un iepriekšējos rezultātus.",
    error: "Kļūda ielādējot spēles. Lūdzu, mēģiniet vēlāk.",
    upcomingMatches: "Gaidāmās Spēles",
    noUpcomingMatches: "Nav ieplānotu gaidāmo spēļu.",
    pastMatches: "Iepriekšējās Spēles",
    noPastMatches: "Nav pieejamu iepriekšējo spēļu."
  }
};

interface MatchesPageClientProps {
  upcomingMatches: Match[];
  pastMatches: Match[];
  errorMessage: string | null;
}

export default function MatchesPageClient({
  upcomingMatches,
  pastMatches,
  errorMessage,
}: MatchesPageClientProps) {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Main large rugby ball */}
          <div className="absolute transform -rotate-45 left-1/4 top-1/4">
            <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Smaller rugby ball top right */}
          <div className="absolute transform rotate-12 right-1/4 top-8">
            <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small rugby ball bottom left */}
          <div className="absolute transform -rotate-20 left-16 bottom-8">
            <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Extra small ball top left */}
          <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
            <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Medium ball bottom right */}
          <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
            <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small ball center right */}
          <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
            <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Tiny ball top center */}
          <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
            <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {matchTranslations[language].title}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {matchTranslations[language].subtitle}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {errorMessage && (
          <div className="bg-rugby-red/10 border border-rugby-red text-rugby-red px-4 py-3 rounded-lg mb-6">
            {matchTranslations[language].error}
          </div>
        )}

        {/* Upcoming Matches */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {matchTranslations[language].upcomingMatches}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match: Match, index: number) => (
              <MatchCard
                key={`upcoming_${match.id}_${index}`}
                match={match}
                isLocalMatch={true}
                variant="default"
              />
            ))}
            {upcomingMatches.length === 0 && (
              <p className="text-muted-foreground">
                {matchTranslations[language].noUpcomingMatches}
              </p>
            )}
          </div>
        </section>

        {/* Past Matches */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {matchTranslations[language].pastMatches}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastMatches.map((match: Match, index: number) => (
              <MatchCard
                key={`past_${match.id}_${index}`}
                match={match}
                isLocalMatch={true}
                variant="default"
              />
            ))}
            {pastMatches.length === 0 && (
              <p className="text-muted-foreground">
                {matchTranslations[language].noPastMatches}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 