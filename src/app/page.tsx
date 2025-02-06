import Image from "next/image";
import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import LatestMatches from "@/components/features/Matches/LatestMatches";
import HeroCarousel from "@/components/features/Hero/HeroCarousel";
import InstagramFeed from "@/components/features/Instagram/InstagramFeed";
import { Match } from "@/types";
import FeaturedPrograms from '@/components/features/Training/FeaturedPrograms';
import { TrainingProgram } from '@/types';

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
    .from('training_programs_with_authors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // Transform the programs data to include the author field
  const programs = programsData?.map(program => ({
    ...program,
    author: program.author_email ? { email: program.author_email } : null
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
            className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
          >
            View all news →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mt-2 mb-3">{article.title}</h3>
                <p className="text-gray-600 mb-4">
                  {article.content.substring(0, 150)}...
                </p>
                <Link
                  href={`/news/${article.slug}`}
                  className="text-accent-blue hover:text-primary-blue transition-colors font-semibold"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-20 bg-primary-blue overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform -rotate-45 -left-1/4 -top-1/4">
            <div className="w-96 h-96 rounded-full bg-white"></div>
          </div>
          <div className="absolute transform -rotate-45 -right-1/4 -bottom-1/4">
            <div className="w-96 h-96 rounded-full bg-white"></div>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/members/join"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-blue bg-white rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                Join Now
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="/team"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors duration-300"
              >
                Meet the Team
              </Link>
            </div>
          </div>

          {/* Image/Stats Section */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-sm opacity-90">Years of Excellence</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-sm opacity-90">Active Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">Annual Matches</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white text-center transform hover:-translate-y-1 transition-transform duration-300">
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
      <FeaturedPrograms programs={programs as TrainingProgram[]} />

      {/* Latest Matches Section */}
      <LatestMatches
        upcomingMatches={upcomingMatches || []}
        completedMatches={completedMatches || []}
      />

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
            <div key={num} className="relative w-48 h-24">
              <Image
                src={`/logo/${num === 1 ? 'Sponsor' : 'Sponsoru'} logo ${num}.png`}
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
