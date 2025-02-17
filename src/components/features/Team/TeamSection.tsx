"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Player } from "@/types";
import PlayerCard from "./PlayerCard";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SwiperContainer } from "@/components/ui/swiper-container";
import { SwiperSlide } from "swiper/react";

const teamTranslations = {
  en: {
    title: "Our Team",
    viewAll: "View All Players"
  },
  lv: {
    title: "Mūsu Komanda",
    viewAll: "Skatīt Visus Spēlētājus"
  }
};

interface TeamSectionProps {
  players: Player[];
}

export default function TeamSection({ players }: TeamSectionProps) {
  const { language } = useLanguage();

  return (
    <section className="bg-white dark:bg-gray-800/50">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {language === 'en' ? teamTranslations.en.title : teamTranslations.lv.title}
          </h2>
          <Link
            href="/team"
            className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            <span>{language === 'en' ? teamTranslations.en.viewAll : teamTranslations.lv.viewAll}</span>
            <ChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Horizontal Scrollable List with contained overflow */}
        <div className="relative -mx-5 px-5">
          <div className="overflow-visible">
            <div className="-my-4">
              <div className="py-4">
                <SwiperContainer
                  slidesPerView="auto"
                  spaceBetween={16}
                  navigation={true}
                  pagination={false}
                  className="!overflow-visible"
                >
                  {players.slice(0, 6).map((player) => (
                    <SwiperSlide key={player.id} className="!w-auto">
                      <div className="w-[240px] sm:w-[260px] pt-4 pb-4 pr-2">
                        <PlayerCard player={player} />
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