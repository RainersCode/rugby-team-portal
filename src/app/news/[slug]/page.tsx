import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';
import { Article, ArticleBlock } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import NewsCard from '@/components/features/News/NewsCard';
import MoreNewsSection from './MoreNewsSection';

interface Props {
  params: {
    slug: string;
  };
}

// Opt out of static generation
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function RenderBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      const headingClasses = cn(
        'font-bold text-secondary-navy',
        block.level === 1 && 'text-3xl mb-6',
        block.level === 2 && 'text-2xl mb-4',
        block.level === 3 && 'text-xl mb-3'
      );
      return <HeadingTag className={headingClasses}>{block.content}</HeadingTag>;

    case 'image':
      return (
        <div className="relative h-[400px] my-8">
          <Image
            src={block.imageUrl || ''}
            alt={block.imageAlt || ''}
            fill
            className="object-cover rounded-lg"
          />
          {block.imageAlt && (
            <p className="text-sm text-content-medium mt-2">{block.imageAlt}</p>
          )}
        </div>
      );

    case 'paragraph':
    default:
      return (
        <p className={cn(
          'mb-4 text-content-medium leading-relaxed',
          block.styles?.italic && 'italic'
        )}>
          {block.content}
        </p>
      );
  }
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const cookieStore = cookies();
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

    // Parse blocks if they're stored as a string
    let blocks;
    if (typeof article.blocks === 'string') {
      try {
        blocks = JSON.parse(article.blocks);
      } catch (e) {
        console.error('Error parsing blocks:', e);
        blocks = [{ type: 'paragraph', content: article.content, styles: {} }];
      }
    } else if (Array.isArray(article.blocks)) {
      blocks = article.blocks;
    } else {
      blocks = [{ type: 'paragraph', content: article.content, styles: {} }];
    }

    return {
      ...article,
      blocks,
      user: userError ? null : userData
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

async function getLatestArticles(currentSlug: string, limit: number = 3): Promise<Article[]> {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .neq('slug', currentSlug)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }

    return articles || [];
  } catch (error) {
    console.error('Unexpected error fetching latest articles:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  // Create a brief excerpt from the content
  const excerpt = article.content.substring(0, 160) + '...';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const articleUrl = `${baseUrl}/news/${params.slug}`;

  return {
    title: article.title,
    description: excerpt,
    openGraph: {
      type: 'article',
      title: article.title,
      description: excerpt,
      url: articleUrl,
      images: [
        {
          url: article.image.startsWith('http') 
            ? article.image 
            : `${baseUrl}${article.image}`,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ],
      siteName: 'Regbija Lapa',
      publishedTime: article.created_at,
      authors: [article.user?.email || 'Regbija Lapa'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: excerpt,
      images: [article.image.startsWith('http') 
        ? article.image 
        : `${baseUrl}${article.image}`
      ],
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  const latestArticles = await getLatestArticles(params.slug);
  
  if (!article) {
    notFound();
  }

  const authorEmail = article.user?.email || 'Anonymous';

  return (
    <div className="container-width py-8">
      <article className="max-w-4xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {article.title}
          </h1>
          <div className="flex items-center text-content-medium gap-4">
            <time className="text-gray-600 dark:text-gray-400">{formatDate(article.created_at)}</time>
            <span className="text-gray-600 dark:text-gray-400">By {authorEmail}</span>
          </div>
        </header>

        {/* Main Article Image */}
        <div className="relative h-[400px] mb-8">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-lg ring-1 ring-rugby-teal/20"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="prose dark:prose-invert max-w-none prose-headings:text-rugby-teal prose-a:text-rugby-teal hover:prose-a:text-rugby-teal/80">
          {Array.isArray(article.blocks) ? (
            article.blocks.map((block, index) => (
              <RenderBlock key={index} block={block} />
            ))
          ) : (
            <p className="mb-4 text-content-medium leading-relaxed">
              {article.content}
            </p>
          )}
        </div>

      </article>

      {/* Latest Articles Section */}
      {latestArticles.length > 0 && (
        <MoreNewsSection articles={latestArticles} />
      )}
    </div>
  );
} 
