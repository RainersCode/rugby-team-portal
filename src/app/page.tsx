import Image from "next/image";
import Link from "next/link";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Fetch latest articles from Supabase
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full">
        <Image
          src="https://picsum.photos/seed/hero/1920/1080"
          alt="Rugby team in action"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
          <div className="container-width text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to Rugby Team</h1>
            <p className="text-xl mb-8 max-w-2xl">
              Experience the passion, power and precision of professional rugby at its finest.
              Join us on our journey to glory.
            </p>
            <Link
              href="/tickets"
              className="bg-primary-blue hover:bg-accent-blue text-white px-8 py-3 rounded-full transition-colors inline-block"
            >
              Get Tickets
            </Link>
          </div>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="container-width">
        <h2 className="text-3xl font-bold mb-8">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                <p className="text-gray-600 mb-4">{article.content.substring(0, 150)}...</p>
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
        <div className="mt-8 text-center">
          <Link
            href="/news"
            className="inline-block bg-primary-blue hover:bg-accent-blue text-white px-8 py-3 rounded-full transition-colors"
          >
            View All News
          </Link>
        </div>
      </section>
    </div>
  );
}
