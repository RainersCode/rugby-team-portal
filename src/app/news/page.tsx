import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/features/News/NewsCard';
import { Article } from '@/types';

interface Props {
  params: { slug: string };
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // First fetch the article without the user relationship
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Article not found
        return null;
      }
      console.error('Database error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null; // Return null instead of throwing to handle errors gracefully
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await getArticle(params.slug);

    if (!article) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found'
      };
    }

    // Create a brief excerpt from the content
    const excerpt = article.content.substring(0, 160) + '...';

    return {
      title: article.title,
      description: excerpt,
      openGraph: {
        title: article.title,
        description: excerpt,
        type: 'article',
        publishedTime: article.created_at,
        images: article.image ? [article.image] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'News',
      description: 'Latest news and updates'
    };
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function NewsPage() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Fetch articles without the user relationship for now
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative py-20 bg-rugby-teal overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Main large rugby ball */}
            <div className="absolute transform -rotate-45 left-1/4 top-1/4">
              <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Smaller rugby ball top right */}
            <div className="absolute transform rotate-12 right-1/4 top-8">
              <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Small rugby ball bottom left */}
            <div className="absolute transform -rotate-20 left-16 bottom-8">
              <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Extra small ball top left */}
            <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
              <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Medium ball bottom right */}
            <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
              <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Small ball center right */}
            <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
              <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Tiny ball top center */}
            <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
              <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
          </div>
          <div className="relative container-width mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Latest News
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Stay updated with the latest news, match reports, and club announcements.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="container-width py-12">
          {!articles || articles.length === 0 ? (
            <p className="text-muted-foreground">No articles found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article as Article} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative py-20 bg-rugby-teal overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Main large rugby ball */}
            <div className="absolute transform -rotate-45 left-1/4 top-1/4">
              <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Smaller rugby ball top right */}
            <div className="absolute transform rotate-12 right-1/4 top-8">
              <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Small rugby ball bottom left */}
            <div className="absolute transform -rotate-20 left-16 bottom-8">
              <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Extra small ball top left */}
            <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
              <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Medium ball bottom right */}
            <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
              <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Small ball center right */}
            <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
              <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Tiny ball top center */}
            <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
              <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
          </div>
          <div className="relative container-width mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Latest News
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Stay updated with the latest news, match reports, and club announcements.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="container-width py-12">
          <p className="text-destructive">Failed to load articles. Please try again later.</p>
        </div>
      </div>
    );
  }
}