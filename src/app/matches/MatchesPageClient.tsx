"use client";

import { Match } from "@/types";
import MatchCard from "@/components/features/Matches/MatchCard";
import { useLanguage } from "@/context/LanguageContext";

const matchTranslations = {
  en: {
    title: "Match Schedule",
    error: "Error fetching matches. Please try again later.",
    upcomingMatches: "Upcoming Matches",
    noUpcomingMatches: "No upcoming matches scheduled.",
    pastMatches: "Past Matches",
    noPastMatches: "No past matches available."
  },
  lv: {
    title: "Spēļu Grafiks",
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
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {matchTranslations[language].title}
          </h1>
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