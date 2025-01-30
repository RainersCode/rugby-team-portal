'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from 'lucide-react';
import { Article, Match } from '@/types';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

interface HeroCarouselProps {
  articles: Article[];
  nextMatch?: Match;
}

export default function HeroCarousel({ articles, nextMatch }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

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
    <section className="relative h-[600px] w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {articles.map((article, index) => (
          <div 
            key={article.id}
            className="absolute w-full h-full transition-opacity duration-500"
            style={{ left: `${index * 100}%` }}
          >
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
              <div className="container-width text-white">
                <span className="inline-block bg-primary-blue text-white text-sm px-3 py-1 rounded-full mb-4">
                  Latest News
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 line-clamp-2">
                  {article.title}
                </h1>
                <p className="text-lg mb-8 max-w-2xl line-clamp-2">
                  {article.content}
                </p>
                <Link
                  href={`/news/${article.slug}`}
                  className="bg-primary-blue hover:bg-accent-blue text-white px-8 py-3 rounded-full transition-colors inline-block"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Match Card */}
      {nextMatch && (
        <div className="absolute bottom-16 right-4 md:right-8 lg:right-12 w-[300px] z-10">
          <Card className="bg-white/95 backdrop-blur-sm shadow-lg hover:scale-[1.02] transition-transform">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-primary-blue">
                  Next Match
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(nextMatch.match_date), 'MMM d')}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                {/* Home Team */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative w-12 h-12 mb-2">
                    <Image
                      src={nextMatch.home_team_image}
                      alt={nextMatch.home_team}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {nextMatch.home_team}
                  </span>
                </div>

                {/* Match Info */}
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-500">VS</span>
                  <span className="text-xs font-medium text-primary-blue mt-1">
                    {format(new Date(nextMatch.match_date), 'HH:mm')}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative w-12 h-12 mb-2">
                    <Image
                      src={nextMatch.away_team_image}
                      alt={nextMatch.away_team}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {nextMatch.away_team}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{nextMatch.venue}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index 
                ? 'bg-white w-4' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
} 