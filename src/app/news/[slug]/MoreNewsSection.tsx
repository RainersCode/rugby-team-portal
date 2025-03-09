"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import NewsCard from '@/components/features/News/NewsCard';
import { Article } from '@/types';
import { ChevronRight } from "lucide-react";

interface MoreNewsSectionProps {
  articles: Article[];
}

export default function MoreNewsSection({ articles }: MoreNewsSectionProps) {
  const { translations } = useLanguage();

  return (
    <section className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-none shadow-lg border-l-4 border-rugby-teal mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-l-4 border-rugby-teal pl-3 py-1">
            {translations.moreNews}
          </h2>
          <Link
            href="/news"
            className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-sm hover:shadow-md rounded-none"
          >
            <span>{translations.viewAllNews}</span>
            <ChevronRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              variant="compact"
            />
          ))}
        </div>
      </div>
    </section>
  );
} 