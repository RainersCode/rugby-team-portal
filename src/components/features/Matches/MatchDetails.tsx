'use client';

import { MatchEvent, PlayerCard } from '@/types';
import { Badge } from '@/components/ui/badge';

export function MatchEventList({ events }: { events: MatchEvent[] }) {
  if (!events?.length) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'try':
        return '🏉';
      case 'conversion':
        return '🎯';
      case 'penalty':
        return '🥅';
      case 'drop_goal':
        return '👟';
      default:
        return '•';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'try':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'conversion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'penalty':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'drop_goal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <span className="bg-rugby-teal/10 text-rugby-teal px-2 py-1 rounded-md">Match Events</span>
      </h4>
      <div className="space-y-2">
        {events.sort((a, b) => a.minute - b.minute).map((event, index) => (
          <div 
            key={index} 
            className="text-sm flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-rugby-teal/5 dark:hover:bg-rugby-teal/10 transition-colors border border-rugby-teal/10"
          >
            {/* Minute */}
            <div className="flex items-center gap-1 min-w-[50px]">
              <span className="font-mono text-rugby-teal">{event.minute}'</span>
            </div>

            {/* Event Type */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
              event.type === 'try' 
                ? 'bg-rugby-red/10 text-rugby-red dark:bg-rugby-red/20 dark:text-rugby-red' 
                : event.type === 'conversion'
                ? 'bg-rugby-yellow/10 text-rugby-yellow dark:bg-rugby-yellow/20 dark:text-rugby-yellow'
                : 'bg-rugby-teal/10 text-rugby-teal dark:bg-rugby-teal/20 dark:text-rugby-teal'
            }`}>
              <span className="font-medium">
                {event.type.toUpperCase()}
                {event.points && ` (${event.points}pts)`}
              </span>
            </div>

            {/* Player & Team */}
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">{event.player}</span>
              <span className="text-rugby-teal">
                ({event.team === 'home' ? 'Home' : 'Away'})
              </span>
            </div>

            {/* Description */}
            {event.description && (
              <div className="text-gray-600 dark:text-gray-400 bg-rugby-teal/5 dark:bg-rugby-teal/10 px-2 py-1 rounded-md">
                {event.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerCardList({ cards }: { cards: PlayerCard[] }) {
  if (!cards?.length) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <span className="bg-rugby-teal/10 text-rugby-teal px-2 py-1 rounded-md">Cards</span>
      </h4>
      <div className="space-y-2">
        {cards.sort((a, b) => a.minute - b.minute).map((card, index) => (
          <div 
            key={index} 
            className="text-sm flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-rugby-teal/5 dark:hover:bg-rugby-teal/10 transition-colors border border-rugby-teal/10"
          >
            {/* Minute */}
            <div className="flex items-center gap-1 min-w-[50px]">
              <span className="font-mono text-rugby-teal">{card.minute}'</span>
            </div>

            {/* Card Type */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
              card.type === 'red' 
                ? 'bg-rugby-red/10 text-rugby-red dark:bg-rugby-red/20 dark:text-rugby-red' 
                : 'bg-rugby-yellow/10 text-rugby-yellow dark:bg-rugby-yellow/20 dark:text-rugby-yellow'
            }`}>
              <span className="text-base">{card.type === 'red' ? '🔴' : '🟨'}</span>
              <span className="font-medium">
                {card.type.toUpperCase()} CARD
              </span>
            </div>

            {/* Player & Team */}
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">{card.player}</span>
              <span className="text-rugby-teal">
                ({card.team === 'home' ? 'Home' : 'Away'})
              </span>
            </div>

            {/* Reason */}
            <div className="text-gray-600 dark:text-gray-400 bg-rugby-teal/5 dark:bg-rugby-teal/10 px-2 py-1 rounded-md">
              {card.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 