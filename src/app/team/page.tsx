"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Player } from "@/types";
import PlayerCard from "@/components/features/Team/PlayerCard";

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

const positions = [
  "All",
  "Prop",
  "Hooker",
  "Lock",
  "Flanker",
  "Number 8",
  "Scrum-half",
  "Fly-half",
  "Center",
  "Wing",
  "Full-back",
];

export default function TeamPage() {
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>(samplePlayers); // Initialize with sample data
  const [loading, setLoading] = useState(false); // Start with false since we have sample data
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
        setPlayers(data); // Only update if we got data from Supabase
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      // Keep using sample data if there's an error
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers =
    selectedPosition === "All"
      ? players
      : players.filter((player) => player.position === selectedPosition);

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
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Team
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Meet the warriors who represent our club with pride and passion.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-width py-12">
        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-xl p-6 shadow-lg border border-rugby-teal/20">
            <div className="text-3xl font-bold text-rugby-teal mb-2">25</div>
            <div className="text-sm text-muted-foreground">
              Squad Players
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg border border-rugby-teal/20">
            <div className="text-3xl font-bold text-rugby-teal mb-2">12</div>
            <div className="text-sm text-muted-foreground">
              International Players
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg border border-rugby-teal/20">
            <div className="text-3xl font-bold text-rugby-teal mb-2">5</div>
            <div className="text-sm text-muted-foreground">
              Trophies Won
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg border border-rugby-teal/20">
            <div className="text-3xl font-bold text-rugby-teal mb-2">85%</div>
            <div className="text-sm text-muted-foreground">
              Win Rate
            </div>
          </div>
        </div>

        {/* Position Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {positions.map((position) => (
            <button
              key={position}
              onClick={() => setSelectedPosition(position)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedPosition === position
                  ? "bg-rugby-teal text-white"
                  : "bg-card text-muted-foreground hover:bg-rugby-yellow/10"
              }`}
            >
              {position}
            </button>
          ))}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
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
