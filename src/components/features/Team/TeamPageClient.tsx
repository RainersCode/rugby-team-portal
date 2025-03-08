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
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
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