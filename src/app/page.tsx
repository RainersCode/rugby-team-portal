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
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[250px]">
          {articles?.slice(0, 6).map((article, index) => {
            // Define different layouts for each card
            const layouts = {
              0: "md:col-span-2 md:row-span-2", // Large featured card
              1: "md:col-span-2 md:row-span-1", // Medium horizontal card
              2: "md:col-span-2 md:row-span-1", // Medium horizontal card
              3: "md:col-span-2 md:row-span-1", // Medium horizontal card
              4: "md:col-span-1 md:row-span-1", // Small square card
              5: "md:col-span-1 md:row-span-1", // Small square card
            };

            return (
              <article
                key={article.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-rugby-teal/20 hover:border-rugby-teal transition-all duration-300 ${
                  layouts[index as keyof typeof layouts]
                }`}
              >
                <Link href={`/news/${article.slug}`} className="block h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className={`font-bold mb-2 line-clamp-2 ${
                        index === 0 ? 'text-2xl' : 'text-lg'
                      }`}>
                        {article.title}
                      </h3>
                      {index === 0 && (
                        <p className="text-sm text-gray-200 line-clamp-2 mb-2">
                          {article.content.substring(0, 150)}...
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-rugby-yellow">
                          Read More
                        </span>
                        <span className="text-xs text-gray-300">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </article>
            );
          })}
        </div>
      </section>

      {/* Latest Matches Section */}
      <LatestMatches
        upcomingMatches={upcomingMatches || []}
        completedMatches={completedMatches || []}
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
              Join Our Rugby Family
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 drop-shadow-lg">
              Be part of something special. Train with the best, play with
              passion, and create lasting memories.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button 
                href="/contact"
                variant="primary"
                size="lg"
                className="bg-white text-rugby-teal hover:bg-white/90"
              >
                Get Started
              </Button>
              <Button 
                href="/activities"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-rugby-teal"
              >
                View Schedule
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Training Programs */}
      {programs.length > 0 && (
        <FeaturedPrograms programs={programs as TrainingProgram[]} />
      )}

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

      {/* Sponsors Section */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container-width">
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
                className="relative w-48 h-24 bg-rugby-teal/40 dark:bg-rugby-teal/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-rugby-teal/30 hover:bg-rugby-teal/50 dark:hover:bg-rugby-teal/60"
              >
                <Image
                  src={`/logo/${num === 1 ? "Sponsor" : "Sponsoru"}_logo_${num}-removebg-preview.png`}
                  alt={`Sponsor ${num}`}
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
