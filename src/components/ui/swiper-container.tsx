'use client';

import { ReactNode, useId } from 'react';
import { Swiper } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SwiperContainerProps {
  children: ReactNode;
  className?: string;
  slidesPerView?: number | 'auto';
  spaceBetween?: number;
  navigation?: boolean;
  pagination?: boolean | { clickable: boolean };
  breakpoints?: {
    [width: number]: {
      slidesPerView: number;
      spaceBetween: number;
    };
  };
}

export function SwiperContainer({
  children,
  className = '',
  slidesPerView = 1.2,
  spaceBetween = 16,
  navigation = true,
  pagination = false,
  breakpoints,
}: SwiperContainerProps) {
  const id = useId().replace(/:/g, '');
  const prevButtonClass = `custom-swiper-button-prev-${id}`;
  const nextButtonClass = `custom-swiper-button-next-${id}`;

  const buttonBaseClasses = "!hidden md:!flex absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/80 hover:bg-rugby-teal text-rugby-teal hover:text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 border border-rugby-teal/20 hover:border-rugby-teal disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:hover:bg-gray-100 disabled:hover:text-gray-400 disabled:hover:border-gray-200 disabled:opacity-40 disabled:cursor-default disabled:shadow-none";

  return (
    <div className="relative group">
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        breakpoints={breakpoints}
        navigation={{
          enabled: true,
          prevEl: `.${prevButtonClass}`,
          nextEl: `.${nextButtonClass}`,
          disabledClass: 'disabled',
        }}
        pagination={pagination}
        className={`w-full ${className}`}
      >
        {children}
      </Swiper>
      {navigation && (
        <>
          <button className={`${prevButtonClass} ${buttonBaseClasses} left-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m15 18-6-6 6-6"/></svg>
            <span className="sr-only">Previous</span>
          </button>
          <button className={`${nextButtonClass} ${buttonBaseClasses} right-4`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m9 18 6-6-6-6"/></svg>
            <span className="sr-only">Next</span>
          </button>
        </>
      )}
    </div>
  );
} 