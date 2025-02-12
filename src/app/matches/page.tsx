import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Match } from "@/types";
import MatchesPageClient from "./MatchesPageClient";

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
    <MatchesPageClient 
      upcomingMatches={upcomingMatches}
      pastMatches={pastMatches}
      errorMessage={errorMessage}
    />
  );
}
