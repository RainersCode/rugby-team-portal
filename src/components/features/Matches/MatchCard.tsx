'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Match } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import { MatchEventList, PlayerCardList } from './MatchDetails';

interface MatchCardProps {
  match: Match;
  isLocalMatch: boolean;
  variant?: 'default' | 'compact';
}

export default function MatchCard({ match, isLocalMatch, variant = 'default' }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';
  const hasDetails = isLocalMatch && isCompleted && (match.description || match.match_events?.length || match.player_cards?.length);

  const cardContent = (
    <>
      {/* Competition & Status */}
      <div className={`flex justify-between items-center ${variant === 'compact' ? 'mb-2' : 'mb-4'}`}>
        <span className={`font-medium text-primary-blue ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
          {match.competition}
        </span>
        <Badge 
          variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
          className={`${variant === 'compact' ? 'text-xs px-2 py-0.5' : ''} ${isLive ? 'animate-pulse bg-red-500 text-white' : ''}`}
        >
          {isLive ? (variant === 'compact' ? 'LIVE' : 'LIVE NOW') : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </Badge>
      </div>

      {/* Teams & Score */}
      <div className={`flex items-center justify-between ${variant === 'compact' ? 'gap-2 mb-2' : 'gap-4 mb-4'}`}>
        {/* Home Team */}
        <div className={`flex-1 flex ${variant === 'compact' ? 'items-center gap-2' : 'flex-col items-center text-center'}`}>
          <div className={`relative ${variant === 'compact' ? 'w-6 h-6 flex-shrink-0' : 'w-16 h-16 mb-2'}`}>
            <Image
              src={match.home_team_image}
              alt={match.home_team}
              fill
              className="object-contain"
            />
          </div>
          <span className={`${variant === 'compact' ? 'text-sm truncate' : 'text-sm font-medium text-gray-900 dark:text-gray-100'}`}>
            {match.home_team}
          </span>
          {isLive && variant !== 'compact' && (
            <div className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {match.home_score}
            </div>
          )}
        </div>

        {/* Score/VS */}
        <div className={`flex ${variant === 'compact' ? 'items-center justify-center min-w-[40px]' : 'flex-col items-center justify-center min-w-[80px]'}`}>
          {isCompleted ? (
            <div className={variant === 'compact' ? 'text-sm font-medium' : 'text-xl font-bold text-gray-900 dark:text-gray-100'}>
              {match.home_score} - {match.away_score}
            </div>
          ) : isLive ? (
            variant === 'compact' ? (
              <span className="text-sm font-bold text-red-500">
                {match.home_score} - {match.away_score}
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl font-bold text-red-500">
                  {match.home_score} - {match.away_score}
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
            )
          ) : (
            <div className={`text-gray-500 ${variant === 'compact' ? 'text-sm' : 'text-lg font-medium'}`}>VS</div>
          )}
        </div>

        {/* Away Team */}
        <div className={`flex-1 flex ${variant === 'compact' ? 'items-center gap-2 justify-end' : 'flex-col items-center text-center'}`}>
          {variant === 'compact' && <span className="text-sm truncate">{match.away_team}</span>}
          <div className={`relative ${variant === 'compact' ? 'w-6 h-6 flex-shrink-0' : 'w-16 h-16 mb-2'}`}>
            <Image
              src={match.away_team_image}
              alt={match.away_team}
              fill
              className="object-contain"
            />
          </div>
          {variant !== 'compact' && (
            <>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{match.away_team}</span>
              {isLive && (
                <div className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {match.away_score}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Match Details */}
      <div className={`flex ${variant === 'compact' ? 'items-center justify-between text-xs' : 'flex-col gap-1.5 text-sm'} text-gray-500`}>
        <div className="flex items-center gap-1">
          <CalendarDays className={variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>
            {format(new Date(match.match_date), variant === 'compact' ? 'MMM d, HH:mm' : 'MMM d, yyyy • HH:mm')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className={variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span className={variant === 'compact' ? 'truncate max-w-[150px]' : ''}>{match.venue}</span>
        </div>
      </div>

      {/* Expandable Match Details (only for non-compact view) */}
      {variant !== 'compact' && hasDetails && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation when clicking the expand button
              setIsExpanded(!isExpanded);
            }}
            className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Details <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {match.description && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Match Summary</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {match.description}
                  </p>
                </div>
              )}
              
              <MatchEventList events={match.match_events || []} />
              <PlayerCardList cards={match.player_cards || []} />
            </div>
          )}
        </>
      )}
    </>
  );

  // Wrap the card in a link if it's a local match
  if (isLocalMatch) {
    return (
      <Link href={`/matches/${match.id}`} className="block">
        <Card 
          className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${
            isLive ? 'ring-2 ring-red-500 shadow-lg' : ''
          } ${variant === 'compact' ? 'p-3' : 'p-4'}`}
        >
          {cardContent}
        </Card>
      </Link>
    );
  }

  // Return without link for non-local matches
  return (
    <Card 
      className={`overflow-hidden hover:shadow-sm transition-all duration-300 ${
        variant === 'compact' ? 'p-3' : 'p-4'
      }`}
    >
      {cardContent}
    </Card>
  );
} 