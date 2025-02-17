'use client';

import { Training } from '@/types';
import { SwiperSlide } from 'swiper/react';
import { SwiperContainer } from '@/components/ui/swiper-container';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface TrainingListProps {
  trainings: Training[];
  title?: string;
  showViewAll?: boolean;
}

function TrainingCard({ training }: { training: Training }) {
  return (
    <Link href={`/training/${training.id}`} className="block">
      <Card className="group relative overflow-hidden transition-all duration-300 border-rugby-teal/20 hover:border-rugby-teal hover:shadow-md">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={training.image || '/images/training-hero.jpg'}
            alt={training.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {training.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {training.description}
          </p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-rugby-teal" />
              <span>
                {format(new Date(training.date), 'MMM d, yyyy • HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rugby-red" />
              <span>{training.location}</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal via-rugby-yellow to-rugby-teal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      </Card>
    </Link>
  );
}

export default function TrainingList({ trainings, title, showViewAll = true }: TrainingListProps) {
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
                href="/training"
                className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
              >
                <span>{translations.viewAllTrainings}</span>
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
            {trainings.map((training) => (
              <SwiperSlide key={training.id}>
                <TrainingCard training={training} />
              </SwiperSlide>
            ))}
          </SwiperContainer>
        </div>

        {/* Desktop View (Grid) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <TrainingCard key={training.id} training={training} />
          ))}
        </div>
      </div>
    </section>
  );
} 