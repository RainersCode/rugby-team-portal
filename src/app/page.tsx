import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageClient from "./HomePageClient";
import { TrainingProgram } from "@/types";

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-dynamic";

export default async function Home() {
  // Get latest data
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Fetch latest articles from Supabase
    const { data: articles } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);

    // Get the first 3 articles for the hero carousel
    const heroArticles = articles?.slice(0, 3) || [];

    // Fetch upcoming matches (next 2)
    const { data: upcomingMatches } = await supabase
      .from("matches")
      .select("*")
      .gte("match_date", new Date().toISOString())
      .order("match_date", { ascending: true })
      .limit(2);

    // Fetch completed matches (last 4)
    const { data: completedMatches } = await supabase
      .from("matches")
      .select("*")
      .lt("match_date", new Date().toISOString())
      .order("match_date", { ascending: false })
      .limit(4);

    // Fetch featured training programs (latest 3 programs)
    const { data: programsData } = await supabase
      .from("training_programs_with_authors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    // Fetch players
    const { data: players } = await supabase
      .from("players")
      .select("*")
      .order("number");

    // Fetch upcoming activities (next 3)
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(3);

    // Map the players data
    const mappedPlayers = players?.map(player => ({
      id: player.id.toString(),
      name: player.name,
      position: player.position,
      number: player.number,
      image: player.image,
      stats: player.stats || {
        matches: 0,
        tries: 0,
        tackles: 0,
        assists: 0
      }
    })) || [];

    // Transform the programs data to include the author field
    const programs =
      programsData?.map((program) => ({
        ...program,
        author: program.author_email ? { email: program.author_email } : null,
      })) || [];

    return (
      <HomePageClient
        heroArticles={heroArticles}
        articles={articles || []}
        upcomingMatches={upcomingMatches || []}
        completedMatches={completedMatches || []}
        programs={programs as TrainingProgram[]}
        players={mappedPlayers}
        activities={activities || []}
      />
    );
  } catch (error) {
    console.error("Error loading homepage data:", error);
    return (
      <HomePageClient 
        heroArticles={[]}
        articles={[]}
        upcomingMatches={[]}
        completedMatches={[]}
        programs={[]}
        players={[]}
        activities={[]}
        error="Failed to load data. Please try again later."
      />
    );
  }
}
