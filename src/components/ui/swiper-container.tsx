'use client';

import { ReactNode } from 'react';
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
  breakpoints,
}: SwiperContainerProps) {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      slidesPerView={slidesPerView}
      spaceBetween={spaceBetween}
      breakpoints={breakpoints}
      pagination={{ clickable: true }}
      className={`w-full ${className}`}
    >
      {children}
    </Swiper>
  );
} 