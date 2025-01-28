import { Player } from '@/types';
import PlayerCard from '@/components/features/Team/PlayerCard';

// This would typically come from an API or database
const players: Player[] = [
  {
    id: 1,
    name: 'James Wilson',
    position: 'Fly-half',
    number: 10,
    image: 'https://picsum.photos/seed/player1/400/600',
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
  {
    id: 2,
    name: 'Tom Brown',
    position: 'Prop',
    number: 1,
    image: 'https://picsum.photos/seed/player2/400/600',
    nationality: 'Wales',
    height: '1.88m',
    weight: '118kg',
    age: 28,
    stats: {
      matches: 52,
      tries: 3,
      assists: 5,
      tackles: 342,
    },
  },
  // Add more players as needed
];

const positionOrder = [
  'Prop',
  'Hooker',
  'Lock',
  'Flanker',
  'Number 8',
  'Scrum-half',
  'Fly-half',
  'Centre',
  'Wing',
  'Full-back',
];

export default function TeamPage() {
  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = [];
    }
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div className="container-width py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Our Team</h1>
        <p className="text-gray-dark">
          Meet our professional rugby squad for the current season.
        </p>
      </div>

      {/* Players Grid */}
      <div className="space-y-12">
        {positionOrder.map((position) => {
          if (!playersByPosition[position]) return null;
          
          return (
            <section key={position}>
              <h2 className="text-2xl font-bold text-secondary-navy mb-6">{position}s</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {playersByPosition[position].map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
} 
