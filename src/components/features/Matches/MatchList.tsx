'use client';

import { Match } from '@/types';
import MatchCard from './MatchCard';
import { SwiperSlide } from 'swiper/react';
import { SwiperContainer } from '@/components/ui/swiper-container';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  title?: string;
  showViewAll?: boolean;
}

export default function MatchList({ matches, title, showViewAll = true }: MatchListProps) {
  const { translations } = useLanguage();

  return (
    <section className="bg-white dark:bg-gray-800/50">
      <div className="container-width py-12">
        {title && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {showViewAll && (
              <Link
                href="/matches"
                className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
              >
                <span>{translations.viewAllMatches}</span>
                <ChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}

        {/* Mobile View (Swiper) */}
        <div className="md:hidden">
          <SwiperContainer
            slidesPerView={1.2}
            spaceBetween={16}
          >
            {matches.map((match) => (
              <SwiperSlide key={match.id}>
                <MatchCard match={match} isLocalMatch={true} />
              </SwiperSlide>
            ))}
          </SwiperContainer>
        </div>

        {/* Desktop View (Grid) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} isLocalMatch={true} />
          ))}
        </div>
      </div>
    </section>
  );
} 