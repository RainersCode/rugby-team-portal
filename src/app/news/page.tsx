import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/features/News/NewsCard';
import { Article } from '@/types';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  image: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  user: {
    email: string;
  } | null;
}

interface Props {
  params: { slug: string };
}

async function getArticle(slug: string): Promise<Article | null> {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found'
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.created_at,
    },
  };
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function NewsPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return <div>Failed to load articles</div>;
  }

  return (
    <div className="container-width py-8">
      <h1 className="text-4xl font-bold text-secondary-navy mb-8">Latest News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles?.map((article) => (
          <NewsCard key={article.id} article={article as Article} />
        ))}
      </div>
    </div>
  );
}