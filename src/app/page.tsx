import Image from "next/image";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import LatestMatches from "@/components/features/Matches/LatestMatches";
import HeroCarousel from "@/components/features/Hero/HeroCarousel";
import InstagramFeed from "@/components/features/Instagram/InstagramFeed";
import TwitterFeed from "@/components/features/Twitter/TwitterFeed";
import FeaturedPrograms from "@/components/features/Training/FeaturedPrograms";
import { TrainingProgram } from "@/types";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-12 pb-12">
      {/* Hero Carousel */}
      <HeroCarousel articles={heroArticles} nextMatch={upcomingMatches?.[0]} />

      {/* News Grid Section */}
      <section className="container-width">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Latest News
          </h2>
          <Link
            href="/news"
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            View all news →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-rugby-teal/20 hover:border-rugby-teal transition-all duration-300"
            >
              <Link href={`/news/${article.slug}`}>
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900 dark:text-gray-100 group-hover:text-rugby-teal transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {article.content.substring(0, 150)}...
                  </p>
                  <span className="text-rugby-teal hover:text-rugby-teal/80 transition-colors font-semibold">
                    Read More
                  </span>
                </div>
              </Link>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </article>
          ))}
        </div>
      </section>

      {/* Twitter Feed Section */}
      <section className="container-width">
        <div className="flex flex-col mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rugby Updates
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Stay updated with the latest rugby news and updates from around the world. Select any account to view their latest tweets.
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

      {/* Call to Action Section */}
      <section className="relative py-24 bg-rugby-teal overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform -rotate-45 -left-1/4 -top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
          <div className="absolute transform -rotate-45 -right-1/4 -bottom-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1 text-white text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Join Our Rugby Family
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90">
              Be part of something special. Train with the best, play with
              passion, and create lasting memories.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button href="/contact" variant="primary" size="lg">
                Get Started
              </Button>
              <Button href="/training" variant="secondary" size="lg">
                View Schedule
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300 border border-white/20">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-sm opacity-90">Years of Excellence</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300 border border-white/20">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-sm opacity-90">Active Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300 border border-white/20">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">Annual Matches</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300 border border-white/20">
              <div className="text-4xl font-bold mb-2">30+</div>
              <div className="text-sm opacity-90">Trophies Won</div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="container-width">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Follow Us on Instagram
          </h2>
          <a
            href="https://instagram.com/your_rugby_team"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
          >
            @your_rugby_team →
          </a>
        </div>
        <InstagramFeed
          accessToken={process.env.INSTAGRAM_ACCESS_TOKEN || ""}
          limit={8}
        />
      </section>

      {/* Featured Training Programs */}
      {programs.length > 0 && (
        <FeaturedPrograms programs={programs as TrainingProgram[]} />
      )}

      {/* Latest Matches Section */}
      {(upcomingMatches?.length ?? 0) > 0 ||
      (completedMatches?.length ?? 0) > 0 ? (
        <LatestMatches
          upcomingMatches={upcomingMatches || []}
          completedMatches={completedMatches || []}
        />
      ) : null}

      {/* Sponsors Section */}
      <section className="container-width bg-gray-50 dark:bg-gray-900 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Sponsors
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Proud partners who support our rugby community
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div
              key={num}
              className="relative w-48 h-24 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-rugby-teal/20"
            >
              <Image
                src={`/logo/${num === 1 ? "Sponsor" : "Sponsoru"}${
                  num === 3 ? "_logo" : " logo"
                } ${num}.png`}
                alt={`Sponsor ${num}`}
                fill
                className="object-contain filter hover:brightness-110 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
