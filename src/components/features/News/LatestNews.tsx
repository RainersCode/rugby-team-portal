"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";
import { SwiperSlide } from 'swiper/react';
import { SwiperContainer } from '@/components/ui/swiper-container';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  image: string;
  created_at: string;
  category?: string; // Optional category field
}

interface LatestNewsProps {
  articles: Article[];
}

export default function LatestNews({ articles }: LatestNewsProps) {
  const { translations, language } = useLanguage();

  useEffect(() => {
    console.log('Language changed to:', language);
    console.log('Current translations:', translations);
    console.log('Latest News translation:', translations.latestNews);
  }, [language, translations]);

  const renderArticle = (article: Article) => (
    <Link href={`/news/${article.slug}`} className="block group">
      <article
        key={article.id}
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-rugby-teal/20 hover:border-rugby-teal transition-all duration-300 h-[250px]"
      >
        <div className="relative w-full h-full">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {article.category && (
              <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold bg-rugby-teal/80 text-white rounded">
                {article.category}
              </span>
            )}
            <h3 className="font-bold mb-2 text-base md:text-lg line-clamp-2">
              {article.title}
            </h3>
            <p className="text-sm text-gray-200 line-clamp-2 mb-2">
              {article.content.substring(0, 150)}...
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-rugby-yellow hover:text-rugby-yellow/80 transition-colors">
                {translations.readMore}
              </span>
              <time className="text-xs text-gray-300" dateTime={article.created_at}>
                {new Date(article.created_at).toLocaleDateString(
                  language === 'lv' ? 'lv-LV' : 'en-GB',
                  { 
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }
                )}
              </time>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </article>
    </Link>
  );

  return (
    <section className="bg-white dark:bg-gray-800/50">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {translations.latestNews}
          </h2>
          <Link
            href="/news"
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            {translations.viewAllNews} →
          </Link>
        </div>

        {/* Mobile View (Swiper) */}
        <div className="md:hidden">
          <SwiperContainer
            slidesPerView={1.2}
            spaceBetween={12}
          >
            {articles?.slice(0, 6).map((article) => (
              <SwiperSlide key={article.id}>
                {renderArticle(article)}
              </SwiperSlide>
            ))}
          </SwiperContainer>
        </div>

        {/* Desktop View (Grid) */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {articles?.slice(0, 6).map((article) => renderArticle(article))}
        </div>
      </div>
    </section>
  );
} 