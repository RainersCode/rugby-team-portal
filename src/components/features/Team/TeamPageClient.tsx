"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "@/types";
import PlayerCard from "@/components/features/Team/PlayerCard";
import { useLanguage } from "@/context/LanguageContext";

const teamTranslations = {
  en: {
    title: "Our Team",
    noPlayers: "No players found"
  },
  lv: {
    title: "Mūsu Komanda",
    noPlayers: "Nav atrasti spēlētāji"
  }
};

interface TeamPageClientProps {
  players: Player[];
}

export default function TeamPageClient({ players }: TeamPageClientProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-rugby-teal/5 dark:bg-rugby-teal/10">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Main large rugby ball */}
          <div className="absolute transform -rotate-45 left-1/4 top-1/4">
            <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Smaller rugby ball top right */}
          <div className="absolute transform rotate-12 right-1/4 top-8">
            <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small rugby ball bottom left */}
          <div className="absolute transform -rotate-20 left-16 bottom-8">
            <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Extra small ball top left */}
          <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
            <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Medium ball bottom right */}
          <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
            <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small ball center right */}
          <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
            <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Tiny ball top center */}
          <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
            <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'en' ? teamTranslations.en.title : teamTranslations.lv.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {players.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              {language === 'en' ? teamTranslations.en.noPlayers : teamTranslations.lv.noPlayers}
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {players.map((player) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PlayerCard player={player} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 