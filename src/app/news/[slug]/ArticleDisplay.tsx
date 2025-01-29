'use client';

import { Article } from '@/data/articles';

interface ArticleDisplayProps {
  article: Article;
}

export default function ArticleDisplay({ article }: ArticleDisplayProps) {
  return (
    <div className="container mx-auto py-10">
      <article className="prose dark:prose-invert lg:prose-xl mx-auto">
        <h1>{article.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {new Date(article.date).toLocaleDateString()}
        </p>
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-[400px] object-cover rounded-lg my-6"
        />
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
} 