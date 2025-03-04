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
    <Link href={`/training/${training.id}`} className="block h-[320px] relative">
      <Card className="peer relative bg-gradient-to-br from-card-bg-light to-card-bg-light/95 dark:from-card-bg-dark dark:to-card-bg-dark/95 overflow-hidden transition-all duration-300 border-2 border-rugby-teal/30 hover:border-rugby-teal hover:shadow-xl rounded-none h-full">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={training.image || '/images/training-hero.jpg'}
            alt={training.title}
            fill
            className="object-cover transition-transform duration-300 peer-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="p-4 flex flex-col h-[calc(100%-160px)]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1">
            {training.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {training.description}
          </p>
          <div className="mt-auto space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-rugby-teal" />
              <span>
                {format(new Date(training.date), 'MMM d, yyyy • HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rugby-red" />
              <span className="truncate">{training.location}</span>
            </div>
          </div>
        </div>
      </Card>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal via-rugby-yellow to-rugby-teal transform scale-x-0 peer-hover:scale-x-100 transition-transform duration-500 ease-out" />
    </Link>
  );
}

export default function TrainingList({ trainings, title, showViewAll = true }: TrainingListProps) {
  const { translations } = useLanguage();

  return (
    <section className="bg-rugby-teal/5 dark:bg-rugby-teal/10">
      <div className="container-width py-12">
        {title && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {showViewAll && (
              <Link
                href="/training"
                className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
              >
                <span>{translations.viewAllTrainings}</span>
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
                  {trainings.map((training) => (
                    <SwiperSlide key={training.id} className="!w-auto">
                      <div className="w-[280px] sm:w-[300px] pt-1 pb-1 pr-1">
                        <TrainingCard training={training} />
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