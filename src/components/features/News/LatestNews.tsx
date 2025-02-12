"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  image: string;
  created_at: string;
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

  const layouts = {
    0: "md:col-span-2 md:row-span-2", // Large featured card
    1: "md:col-span-2 md:row-span-1", // Medium horizontal card
    2: "md:col-span-2 md:row-span-1", // Medium horizontal card
    3: "md:col-span-2 md:row-span-1", // Medium horizontal card
    4: "md:col-span-1 md:row-span-1", // Small square card
    5: "md:col-span-1 md:row-span-1", // Small square card
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[250px]">
          {articles?.slice(0, 6).map((article, index) => (
            <article
              key={article.id}
              className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-rugby-teal/20 hover:border-rugby-teal transition-all duration-300 ${
                layouts[index as keyof typeof layouts]
              }`}
            >
              <Link href={`/news/${article.slug}`} className="block h-full">
                <div className="relative w-full h-full">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className={`font-bold mb-2 line-clamp-2 ${
                      index === 0 ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
                    }`}>
                      {article.title}
                    </h3>
                    {index === 0 && (
                      <p className="hidden md:block text-sm text-gray-200 line-clamp-2 mb-2">
                        {article.content.substring(0, 150)}...
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-rugby-yellow">
                        {translations.readMore}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(article.created_at).toLocaleDateString(
                          language === 'lv' ? 'lv-LV' : 'en-US',
                          { 
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
} 