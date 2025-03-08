"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";
import { SwiperSlide } from 'swiper/react';
import { SwiperContainer } from '@/components/ui/swiper-container';
import { ChevronRight } from "lucide-react";

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
    <div className="news-card-container">
      <Link href={`/news/${article.slug}`} className="block">
        <article
          key={article.id}
          className="relative bg-gradient-to-br from-card-bg-light to-card-bg-light/95 dark:from-card-bg-dark dark:to-card-bg-dark/95 rounded-none shadow-lg overflow-hidden border-2 border-rugby-teal/30 hover:shadow-xl transition-all duration-300 h-[250px] news-card"
        >
          <div className="relative w-full h-full">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 news-card-image"
            />
            {/* Base overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Hover overlay - separate element for stronger effect */}
            <div className="absolute inset-0 bg-black/50 opacity-0 news-card-overlay transition-opacity duration-300 z-0 pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
              {article.category && (
                <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold bg-rugby-teal/80 text-white rounded">
                  {article.category}
                </span>
              )}
              <h3 className="font-medium mb-2 text-base md:text-lg line-clamp-2">
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
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow transform scale-x-0 news-card-line transition-transform duration-300" />
        </article>
      </Link>
      
      <style jsx>{`
        .news-card-container:hover .news-card {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .news-card-container:hover .news-card-overlay {
          opacity: 1;
        }
        .news-card-container:hover .news-card-line {
          transform: scaleX(1);
          transform-origin: center;
        }
        .news-card-container:hover .news-card-image {
          transform: scale(1.05);
        }
        .news-card-line {
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.5s ease-out;
        }
      `}</style>
    </div>
  );

  return (
    <section className="bg-rugby-teal/5 dark:bg-rugby-teal/10">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-l-4 border-rugby-teal pl-3 py-1">
            {translations.latestNews}
          </h2>
          <Link
            href="/news"
            className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
          >
            <ChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile View (Swiper) */}
        <div className="md:hidden">
          <SwiperContainer
            slidesPerView={1.2}
            spaceBetween={6}
          >
            {articles?.slice(0, 6).map((article) => (
              <SwiperSlide key={article.id}>
                {renderArticle(article)}
              </SwiperSlide>
            ))}
          </SwiperContainer>
        </div>

        {/* Desktop View (Grid) */}
        <div className="hidden md:grid grid-cols-3 gap-2">
          {articles?.slice(0, 6).map((article) => renderArticle(article))}
        </div>
      </div>
    </section>
  );
} 