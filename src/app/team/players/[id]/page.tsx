import { Player } from '@/types';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// This would typically come from an API or database
const players: Player[] = [
  {
    id: 1,
    name: 'James Wilson',
    position: 'Fly-half',
    number: 10,
    image: 'https://picsum.photos/seed/player1/800/1200',
    nationality: 'England',
    height: '1.83m',
    weight: '88kg',
    age: 25,
    stats: {
      matches: 45,
      tries: 12,
      assists: 34,
      tackles: 156,
    },
  },
  // Add more players as needed
];

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const player = players.find((p) => p.id === parseInt(params.id));

  if (!player) {
    notFound();
  }

  return (
    <div className="container-width py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player Image */}
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
            <Image
              src={player.image}
              alt={player.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Player Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-secondary-navy mb-2">
                {player.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary-blue">#{player.number}</span>
                <span className="text-xl text-gray-dark">{player.position}</span>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-secondary-navy mb-4">
                  Personal Information
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-gray-medium">Nationality</dt>
                    <dd className="font-semibold text-gray-dark">{player.nationality}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-medium">Age</dt>
                    <dd className="font-semibold text-gray-dark">{player.age}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-medium">Height</dt>
                    <dd className="font-semibold text-gray-dark">{player.height}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-medium">Weight</dt>
                    <dd className="font-semibold text-gray-dark">{player.weight}</dd>
                  </div>
                </dl>
              </div>

              {/* Statistics */}
              <div>
                <h2 className="text-lg font-semibold text-secondary-navy mb-4">
                  Career Statistics
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-gray-medium">Matches Played</dt>
                    <dd className="font-semibold text-gray-dark">{player.stats.matches}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-medium">Tries Scored</dt>
                    <dd className="font-semibold text-gray-dark">{player.stats.tries}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-medium">Assists</dt>
                    <dd className="font-semibold text-gray-dark">{player.stats.assists}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-medium">Tackles Made</dt>
                    <dd className="font-semibold text-gray-dark">{player.stats.tackles}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Career Highlights */}
            <div>
              <h2 className="text-lg font-semibold text-secondary-navy mb-4">
                Career Highlights
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-dark">
                <li>International debut in 2020</li>
                <li>Player of the Match in 3 consecutive games (2023)</li>
                <li>Team&apos;s top scorer in the 2022/23 season</li>
                <li>Selected for the National Team Squad in 2023</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
