'use client';

import { Player } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const playerCardTranslations = {
  en: {
    height: "Height",
    weight: "Weight",
    age: "Age",
    nation: "Nation",
    matches: "Matches",
    tries: "Tries",
    assists: "Assists",
    tackles: "Tackles"
  },
  lv: {
    height: "Augums",
    weight: "Svars",
    age: "Vecums",
    nation: "Valsts",
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
    <div className="group relative bg-gradient-to-br from-card-bg-light to-card-bg-light/95 dark:from-card-bg-dark dark:to-card-bg-dark/95 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-rugby-teal/10 hover:border-rugby-teal/30 cursor-pointer">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.08),transparent_40%)]" />
      
      {/* Player number watermark */}
      <div className="absolute -right-4 -top-6 text-[120px] font-black text-rugby-teal/5 dark:text-rugby-teal/10 select-none">
        {player.number}
      </div>

      {/* Image container with gradient overlay */}
      <div className="relative h-72">
        <Image
          src={player.image || 'https://picsum.photos/seed/player1/800/1200'} // Fallback image if none provided
          alt={player.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Player name and position overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-2xl font-bold text-white group-hover:text-rugby-yellow transition-colors">
            {player.name}
          </h3>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-sm uppercase tracking-wider">{player.position}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rugby-yellow/80" />
            <span className="text-sm font-medium">#{player.number}</span>
          </div>
        </div>
      </div>

      {/* Player info section */}
      <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
        {/* Physical stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-rugby-teal/5 dark:bg-rugby-teal/10 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t.height}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{player.height || '-'}</p>
          </div>
          <div className="text-center p-2 bg-rugby-teal/5 dark:bg-rugby-teal/10 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t.weight}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{player.weight || '-'}</p>
          </div>
          <div className="text-center p-2 bg-rugby-teal/5 dark:bg-rugby-teal/10 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t.age}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{player.age || '-'}</p>
          </div>
          <div className="text-center p-2 bg-rugby-teal/5 dark:bg-rugby-teal/10 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t.nation}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{player.nationality || '-'}</p>
          </div>
        </div>

        {/* Performance stats */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-rugby-teal">{player.stats?.matches || 0}</p>
            <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">{t.matches}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rugby-yellow">{player.stats?.tries || 0}</p>
            <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">{t.tries}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rugby-teal">{player.stats?.assists || 0}</p>
            <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">{t.assists}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rugby-yellow">{player.stats?.tackles || 0}</p>
            <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">{t.tackles}</p>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal via-rugby-yellow to-rugby-teal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
    </div>
  );
} 
