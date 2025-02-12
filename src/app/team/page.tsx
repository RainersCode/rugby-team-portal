"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Player } from "@/types";
import PlayerCard from "@/components/features/Team/PlayerCard";
import { useLanguage } from "@/context/LanguageContext";

// Sample data for development
const samplePlayers: Player[] = [
  {
    id: 1,
    name: "James Wilson",
    position: "Fly-half",
    number: 10,
    image: "https://picsum.photos/seed/player1/800/1200",
    nationality: "England",
    height: "1.83m",
    weight: "88kg",
    age: 25,
    stats: {
      matches: 45,
      tries: 12,
      assists: 34,
      tackles: 156,
    },
  },
  {
    id: 2,
    name: "Tom Smith",
    position: "Prop",
    number: 1,
    image: "https://picsum.photos/seed/player2/800/1200",
    nationality: "Wales",
    height: "1.88m",
    weight: "118kg",
    age: 28,
    stats: {
      matches: 52,
      tries: 5,
      assists: 8,
      tackles: 245,
    },
  },
  {
    id: 3,
    name: "David Jones",
    position: "Scrum-half",
    number: 9,
    image: "https://picsum.photos/seed/player3/800/1200",
    nationality: "Scotland",
    height: "1.75m",
    weight: "82kg",
    age: 24,
    stats: {
      matches: 38,
      tries: 15,
      assists: 42,
      tackles: 128,
    },
  },
  // Add more sample players as needed
];

const teamTranslations = {
  en: {
    title: "Our Team"
  },
  lv: {
    title: "Mūsu Komanda"
  }
};

export default function TeamPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>(samplePlayers);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("number");

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setPlayers(data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
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
        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
