import { notFound } from 'next/navigation';
import { articles } from '@/data/articles';
import { Metadata } from 'next';
import ArticleDisplay from './ArticleDisplay';

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articles.find((article) => article.slug === params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
  };
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default function ArticlePage({ params }: Props) {
  const article = articles.find((article) => article.slug === params.slug);

  if (!article) {
    notFound();
  }

  return <ArticleDisplay article={article} />;
} 
