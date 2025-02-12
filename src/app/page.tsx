import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageClient from "./HomePageClient";
import { TrainingProgram } from "@/types";

export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

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
    />
  );
}
