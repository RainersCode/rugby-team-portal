import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Match } from "@/types";
import TournamentsPageClient from "./TournamentsPageClient";

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Fetch current seasons
    const { data: championshipSeason } = await supabase
      .from("championship_seasons")
      .select("*")
      .eq("is_current", true)
      .single();

    // Fetch standings
    const { data: championshipStandings } = await supabase
      .from("current_championship_standings")
      .select("*")
      .order("position");

    const { data: sevensStandings } = await supabase
      .from("current_sevens_standings")
      .select("*")
      .order("position");

    const { data: cupMatches } = await supabase
      .from("cup_matches")
      .select("*")
      .order("round", { ascending: false });

    // Fetch upcoming matches
    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true });

    const now = new Date();
    const upcomingMatches = (matches || [])
      .filter(
        (match: Match) =>
          (new Date(match.match_date) > now && match.status === "upcoming") ||
          match.status === "live"
      )
      .sort(
        (a: Match, b: Match) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
      );

    return (
      <TournamentsPageClient
        championshipSeason={championshipSeason}
        championshipStandings={championshipStandings || []}
        sevensStandings={sevensStandings || []}
        cupMatches={cupMatches || []}
        upcomingMatches={upcomingMatches}
      />
    );
  } catch (error) {
    console.error("Error in TournamentsPage:", error);
    return <div>Error loading tournaments page.</div>;
  }
}
