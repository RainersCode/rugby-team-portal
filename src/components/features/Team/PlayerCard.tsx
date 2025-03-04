'use client';

import { Player } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const playerCardTranslations = {
  en: {
    height: "Height",
    weight: "Weight",
    age: "Age",
    matches: "Matches",
    tries: "Tries",
    assists: "Assists",
    tackles: "Tackles"
  },
  lv: {
    height: "Augums",
    weight: "Svars",
    age: "Vecums",
    matches: "Spēles",
    tries: "Pielikumi",
    assists: "Piespēles",
    tackles: "Tackles"
  }
};

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const { language } = useLanguage();
  const t = language === 'en' ? playerCardTranslations.en : playerCardTranslations.lv;

  return (
    <div className="relative group">
      <div className="peer relative bg-gradient-to-br from-card-bg-light to-card-bg-light/95 dark:from-card-bg-dark dark:to-card-bg-dark/95 overflow-hidden transition-all duration-300 border-2 border-rugby-teal/30 hover:border-rugby-teal hover:shadow-xl rounded-none">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.08),transparent_40%)]" />
        
        {/* Player number watermark */}
        <div className="absolute -right-4 -top-6 text-[80px] font-black text-rugby-teal/5 dark:text-rugby-teal/10 select-none">
          {player.number}
        </div>

        {/* Content wrapper with overflow handling */}
        <div className="relative overflow-hidden">
          {/* Image container with gradient overlay */}
          <div className="relative aspect-[2/3]">
            <Image
              src={player.image || 'https://picsum.photos/seed/player1/800/1200'} // Fallback image if none provided
              alt={player.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Player name and position overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-base sm:text-lg font-bold text-white peer-hover:text-rugby-yellow transition-colors whitespace-normal">
                {player.name}
              </h3>
              <div className="flex items-center gap-2 text-white/90 mt-1">
                <span className="text-xs uppercase tracking-wider">{player.position}</span>
                <span className="w-1 h-1 rounded-full bg-rugby-yellow/80" />
                <span className="text-xs font-medium">#{player.number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom accent line with center origin animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <div className="h-full bg-gradient-to-r from-rugby-teal via-rugby-yellow to-rugby-teal transform scale-x-0 peer-hover:scale-x-100 transition-transform duration-500 ease-out origin-center" />
      </div>
    </div>
  );
} 
