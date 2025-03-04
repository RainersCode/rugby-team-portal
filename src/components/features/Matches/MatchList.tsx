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
    <section className="bg-rugby-teal/20 dark:bg-rugby-teal/30">
      <div className="container-width py-12">
        {title && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {showViewAll && (
              <Link
                href="/matches"
                className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
              >
                <span>{translations.viewAllMatches}</span>
                <ChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}

        {/* Horizontal Scrollable List with contained overflow */}
        <div className="relative -mx-5 px-5">
          <div className="overflow-hidden">
            <div className="-my-2">
              <div className="py-2">
                <SwiperContainer
                  slidesPerView="auto"
                  spaceBetween={12}
                  navigation={true}
                  pagination={false}
                  className="!overflow-visible"
                >
                  {matches.map((match) => (
                    <SwiperSlide key={match.id} className="!w-auto">
                      <div className="w-[280px] sm:w-[300px] pt-1 pb-1 pr-1">
                        <MatchCard match={match} isLocalMatch={true} />
                      </div>
                    </SwiperSlide>
                  ))}
                </SwiperContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 