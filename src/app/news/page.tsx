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

    if (!articles || articles.length === 0) {
      return (
        <div className="container-width py-8">
          <h1 className="text-4xl font-bold text-secondary-navy mb-8">Latest News</h1>
          <p className="text-gray-600">No articles found.</p>
        </div>
      );
    }

    return (
      <div className="container-width py-8">
        <h1 className="text-4xl font-bold text-secondary-navy mb-8">Latest News</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article as Article} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    return (
      <div className="container-width py-8">
        <h1 className="text-4xl font-bold text-secondary-navy mb-8">Latest News</h1>
        <p className="text-red-600">Failed to load articles. Please try again later.</p>
      </div>
    );
  }
}