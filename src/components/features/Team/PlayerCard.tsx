'use client';

import { Player } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/team/players/${player.id}`}>
      <div className="bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
        <div className="relative h-64">
          <Image
            src={player.image}
            alt={player.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-content-light dark:text-content-dark hover:text-primary-blue dark:hover:text-accent-blue transition-colors">
                {player.name}
              </h3>
              <p className="text-content-medium dark:text-content-medium">{player.position}</p>
            </div>
            <span className="text-3xl font-bold text-primary-blue dark:text-accent-blue">
              {player.number}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-content-light dark:text-content-light">Height</p>
              <p className="font-semibold text-content-medium dark:text-content-medium">{player.height}</p>
            </div>
            <div>
              <p className="text-content-light dark:text-content-light">Weight</p>
              <p className="font-semibold text-content-medium dark:text-content-medium">{player.weight}</p>
            </div>
            <div>
              <p className="text-content-light dark:text-content-light">Age</p>
              <p className="font-semibold text-content-medium dark:text-content-medium">{player.age}</p>
            </div>
            <div>
              <p className="text-content-light dark:text-content-light">Nationality</p>
              <p className="font-semibold text-content-medium dark:text-content-medium">{player.nationality}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <p className="text-content-light dark:text-content-light">Matches</p>
                <p className="font-bold text-content-medium dark:text-content-medium">{player.stats.matches}</p>
              </div>
              <div>
                <p className="text-content-light dark:text-content-light">Tries</p>
                <p className="font-bold text-content-medium dark:text-content-medium">{player.stats.tries}</p>
              </div>
              <div>
                <p className="text-content-light dark:text-content-light">Assists</p>
                <p className="font-bold text-content-medium dark:text-content-medium">{player.stats.assists}</p>
              </div>
              <div>
                <p className="text-content-light dark:text-content-light">Tackles</p>
                <p className="font-bold text-content-medium dark:text-content-medium">{player.stats.tackles}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 
