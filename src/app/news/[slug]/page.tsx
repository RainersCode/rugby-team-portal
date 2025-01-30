import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';
import { Article } from '@/types';

interface Props {
  params: {
    slug: string;
  };
}

// Opt out of static generation
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // First, get the article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (articleError) {
      console.error('Error fetching article:', articleError);
      return null;
    }

    if (!article) {
      return null;
    }

    // Then, get the author information
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', article.author_id)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return {
        ...article,
        user: null
      };
    }

    return {
      ...article,
      user: userData
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.content.substring(0, 160),
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const authorEmail = article.user?.email || 'Anonymous';

  return (
    <div className="container-width py-8">
      <article className="max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-navy mb-4">
            {article.title}
          </h1>
          <div className="flex items-center text-content-medium gap-4">
            <time>{formatDate(article.created_at)}</time>
            <span>By {authorEmail}</span>
          </div>
        </header>

        {/* Article Image */}
        <div className="relative h-[400px] mb-8">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="prose dark:prose-invert max-w-none">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
} 
