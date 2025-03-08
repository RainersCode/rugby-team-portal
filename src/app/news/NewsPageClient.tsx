"use client";

import { Article } from '@/types';
import NewsCard from '@/components/features/News/NewsCard';
import { useLanguage } from "@/context/LanguageContext";

const newsTranslations = {
  en: {
    title: "Latest News",
    noArticles: "No articles found.",
    error: "Failed to load articles. Please try again later."
  },
  lv: {
    title: "Jaunākās Ziņas",
    noArticles: "Nav atrasti raksti.",
    error: "Neizdevās ielādēt rakstus. Lūdzu, mēģiniet vēlāk."
  }
};

interface NewsPageClientProps {
  articles: Article[] | null;
  error?: boolean;
}

export default function NewsPageClient({ articles, error }: NewsPageClientProps) {
  const { language } = useLanguage();
  const t = newsTranslations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {error ? (
          <p className="text-destructive">{t.error}</p>
        ) : !articles || articles.length === 0 ? (
          <p className="text-muted-foreground">{t.noArticles}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article as Article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 