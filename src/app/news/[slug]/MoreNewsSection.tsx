"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import NewsCard from '@/components/features/News/NewsCard';
import { Article } from '@/types';

interface MoreNewsSectionProps {
  articles: Article[];
}

export default function MoreNewsSection({ articles }: MoreNewsSectionProps) {
  const { translations } = useLanguage();

  return (
    <section className="mt-16 max-w-4xl mx-auto border-t border-rugby-teal/10 pt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-rugby-teal">
          {translations.moreNews}
        </h2>
        <Link
          href="/news"
          className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors text-sm"
        >
          {translations.viewAllNews} →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <NewsCard 
            key={article.id} 
            article={article} 
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
} 