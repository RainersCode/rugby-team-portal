'use client';

import { Article } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: Article;
  priority?: boolean;
}

export default function NewsCard({ article, priority = false }: NewsCardProps) {
  return (
    <article className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <Link href={`/news/${article.slug}`}>
        <div className="relative h-48">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-blue dark:text-accent-blue font-semibold">
              {article.category}
            </span>
            <time className="text-sm text-content-medium dark:text-content-medium">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </time>
          </div>
          <h3 className="text-xl font-bold mb-2 text-content-light dark:text-content-dark line-clamp-2 hover:text-primary-blue dark:hover:text-accent-blue transition-colors">
            {article.title}
          </h3>
          <p className="text-content-medium dark:text-content-medium line-clamp-3">
            {article.excerpt}
          </p>
          <div className="mt-4 flex items-center text-sm text-content-light dark:text-content-light">
            <span>By {article.author}</span>
          </div>
        </div>
      </Link>
    </article>
  );
} 
