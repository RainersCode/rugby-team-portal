"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { Article, Match } from "@/types";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface HeroCarouselProps {
  articles: Article[];
  nextMatch?: Match;
}

export default function HeroCarousel({
  articles,
  nextMatch,
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { translations } = useLanguage();

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [articles.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {articles.map((article, index) => (
          <div
            key={article.id}
            className="relative w-full h-full flex-shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-10" />
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 z-20 flex items-center pb-32 md:pb-40">
              <div className="container-width text-white px-4 md:px-0 animate-fade-in-up">
                <span className="inline-block bg-gradient-to-r from-rugby-teal to-rugby-teal/80 text-white text-xs md:text-sm px-4 py-1.5 rounded-none mb-3 md:mb-4 shadow-lg backdrop-blur-sm">
                  {translations.latestNews}
                </span>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 line-clamp-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] md:drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] [text-shadow:_1px_1px_2px_rgb(0_0_0_/_40%)] md:[text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
                  {article.title}
                </h1>
                <p className="text-base md:text-lg mb-6 md:mb-8 max-w-2xl line-clamp-2 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  {article.content}
                </p>
                <Button
                  href={`/news/${article.slug}`}
                  variant="ghost"
                  size="md"
                  className="group bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none text-rugby-teal hover:text-rugby-teal/90 transition-all duration-300"
                >
                  <span className="font-medium">{translations.readMore}</span>
                  <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Match Card */}
      {nextMatch && (
        <div className="absolute bottom-0 left-0 right-0 md:bottom-16 md:left-auto md:right-8 lg:right-12 w-full md:w-[360px] z-10">
          <Card className="bg-gradient-to-br from-white/95 via-rugby-teal/20 to-gray-100/95 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-none backdrop-blur-sm">
            <div className="p-3 md:p-4">
              <div className="flex justify-between items-center mb-1.5 md:mb-3">
                <span className="text-[10px] md:text-xs font-medium bg-rugby-teal text-white px-2 py-0.5 md:px-3 md:py-1 rounded-none shadow-sm">
                  Next Match
                </span>
                <span className="text-[10px] md:text-xs font-bold text-gray-900 bg-white/80 px-2 py-0.5 rounded-none shadow-sm">
                  {format(new Date(nextMatch.match_date), "MMM d")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 md:gap-6 bg-gradient-to-br from-rugby-teal/10 via-white/90 to-transparent p-2 md:p-3 rounded-none border border-rugby-teal/20">
                {/* Home Team */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative w-6 h-6 md:w-12 md:h-12 mb-1 md:mb-2 transform hover:scale-110 transition-transform duration-300">
                    <Image
                      src={nextMatch.home_team_image}
                      alt={nextMatch.home_team}
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold text-gray-900">
                    {nextMatch.home_team}
                  </span>
                </div>

                {/* Match Info */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] md:text-sm font-bold text-rugby-teal">
                    VS
                  </span>
                  <span className="text-[8px] md:text-xs font-medium text-gray-800 mt-0.5 md:mt-1">
                    {format(new Date(nextMatch.match_date), "HH:mm")}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative w-6 h-6 md:w-12 md:h-12 mb-1 md:mb-2 transform hover:scale-110 transition-transform duration-300">
                    <Image
                      src={nextMatch.away_team_image}
                      alt={nextMatch.away_team}
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                  <span className="text-[10px] md:text-sm font-semibold text-gray-900">
                    {nextMatch.away_team}
                  </span>
                </div>
              </div>

              <div className="mt-1.5 md:mt-3 pt-1.5 md:pt-3 border-t border-rugby-teal/20">
                <div className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-xs">
                  <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-rugby-red" />
                  <span className="truncate text-gray-900 font-medium bg-white/80 px-2 py-0.5 rounded-none">
                    {nextMatch.venue}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 md:p-3 rounded-none transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 md:p-3 rounded-none transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 ${
              currentSlide === index
                ? "w-6 md:w-8 h-1.5 bg-rugby-yellow rounded-none"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/75 rounded-none"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
