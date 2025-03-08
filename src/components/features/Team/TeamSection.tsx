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
    <section className="bg-rugby-teal/5 dark:bg-rugby-teal/10">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-l-4 border-rugby-teal pl-3 py-1">
            {language === 'en' ? teamTranslations.en.title : teamTranslations.lv.title}
          </h2>
          <Link
            href="/team"
            className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
          >
            <ChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Horizontal Scrollable List with contained overflow */}
        <div className="relative -mx-5 px-5">
          <div className="overflow-hidden">
            <div className="-my-2">
              <div className="py-2">
                <SwiperContainer
                  slidesPerView="auto"
                  spaceBetween={6}
                  navigation={true}
                  pagination={false}
                  className="!overflow-visible"
                >
                  {players.slice(0, 6).map((player) => (
                    <SwiperSlide key={player.id} className="!w-auto">
                      <div className="w-[180px] xs:w-[200px] sm:w-[220px] lg:w-[260px] pt-0.5 pb-0.5 pr-0.5">
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