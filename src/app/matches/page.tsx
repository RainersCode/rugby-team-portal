import Image from "next/image";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { Match } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import MatchCard from "@/components/features/Matches/MatchCard";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  let databaseMatches: Match[] = [];
  let errorMessage: string | null = null;

  try {
    // Fetch matches from database
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });
    const { data: dbMatches, error: dbError } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });

    if (dbError) {
      console.error("Error fetching database matches:", dbError);
      errorMessage = "Error fetching matches. Please try again later.";
    } else {
      databaseMatches = dbMatches || [];
    }
  } catch (error) {
    console.error("Error fetching matches:", error);
    errorMessage = "Error fetching matches. Please try again later.";
  }

  const now = new Date();

  // Process database matches
  const upcomingMatches = databaseMatches
    .filter(
      (match: Match) =>
        (new Date(match.match_date) > now && match.status === "upcoming") ||
        match.status === "live"
    )
    .sort(
      (a: Match, b: Match) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    );

  const pastMatches = databaseMatches
    .filter((match: Match) => match.status === "completed")
    .sort(
      (a: Match, b: Match) =>
        new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Match Schedule
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Follow our team's journey through the season. View upcoming fixtures
            and past results.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {errorMessage && (
          <div className="bg-rugby-red/10 border border-rugby-red text-rugby-red px-4 py-3 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        {/* Upcoming Matches */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Upcoming Matches
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
                No upcoming matches scheduled.
              </p>
            )}
          </div>
        </section>

        {/* Past Matches */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Past Matches
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
                No past matches available.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
