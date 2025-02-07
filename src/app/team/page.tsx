"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Player } from "@/types";
import PlayerCard from "@/components/features/Team/PlayerCard";

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("number");

      if (error) {
        throw error;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error("Error fetching players:", error);
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
      <div className="relative py-20 bg-primary-blue overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-white"></div>
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
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-blue mb-2">25</div>
            <div className="text-sm text-muted-foreground">
              Squad Players
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-blue mb-2">12</div>
            <div className="text-sm text-muted-foreground">
              International Players
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-blue mb-2">5</div>
            <div className="text-sm text-muted-foreground">
              Trophies Won
            </div>
          </div>
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-blue mb-2">85%</div>
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
                  ? "bg-primary-blue text-white"
                  : "bg-card text-muted-foreground hover:bg-accent"
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
              className="group"
            >
              <div
                className="bg-card rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-300 hover:-translate-y-2"
                onClick={() =>
                  setSelectedPlayer(
                    selectedPlayer === player.id ? null : player.id
                  )
                }
              >
                <div className="relative h-80">
                  <Image
                    src={player.image}
                    alt={player.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{player.name}</h3>
                        <p className="text-sm opacity-90">{player.position}</p>
                      </div>
                      <div className="text-2xl font-bold">#{player.number}</div>
                    </div>
                  </div>
                </div>

                {/* Player Details (Expandable) */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    selectedPlayer === player.id ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-4 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary-blue">
                          {player.stats.matches}
                        </div>
                        <div className="text-sm text-muted-foreground">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary-blue">
                          {player.stats.tries}
                        </div>
                        <div className="text-sm text-muted-foreground">Tries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-primary-blue">
                          {player.stats.tackles}
                        </div>
                        <div className="text-sm text-muted-foreground">Tackles</div>
                      </div>
                    </div>

                    {/* Social Links */}
                    {(player.social?.instagram || player.social?.twitter) && (
                      <div className="flex justify-center gap-4">
                        {player.social.instagram && (
                          <a
                            href={`https://instagram.com/${player.social.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary-blue"
                          >
                            Instagram
                          </a>
                        )}
                        {player.social.twitter && (
                          <a
                            href={`https://twitter.com/${player.social.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary-blue"
                          >
                            Twitter
                          </a>
                        )}
                      </div>
                    )}

                    {/* Achievements */}
                    {player.achievements?.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Achievements</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {player.achievements.map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
