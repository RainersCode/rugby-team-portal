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
        <span className={`font-medium text-rugby-teal ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
          {match.competition}
        </span>
        <Badge 
          variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
          className={`${variant === 'compact' ? 'text-xs px-2 py-0.5' : ''} ${
            isLive 
              ? 'animate-pulse bg-rugby-red text-white' 
              : isCompleted 
                ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20'
                : 'bg-rugby-teal/10 text-rugby-teal hover:bg-rugby-teal/20'
          }`}
        >
          {isLive ? (variant === 'compact' ? 'LIVE' : 'LIVE NOW') : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </Badge>
      </div>

      {/* Teams & Score */}
      <div className={`flex items-center justify-between gap-4 ${variant === 'compact' ? 'mb-2' : 'mb-4'}`}>
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
        </div>

        {/* Score/VS */}
        <div className="flex flex-col items-center">
          {isCompleted ? (
            <div className={variant === 'compact' ? 'text-sm font-medium' : 'text-xl font-bold text-rugby-teal'}>
              {match.home_score} - {match.away_score}
            </div>
          ) : isLive ? (
            variant === 'compact' ? (
              <span className="text-sm font-bold text-rugby-red">
                {match.home_score} - {match.away_score}
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl font-bold text-rugby-red">
                  {match.home_score} - {match.away_score}
                </div>
                <span className="text-xs font-semibold text-rugby-red bg-rugby-red/10 px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
            )
          ) : (
            <div className={`text-rugby-yellow ${variant === 'compact' ? 'text-sm' : 'text-lg font-medium'}`}>VS</div>
          )}
        </div>

        {/* Away Team */}
        <div className={`flex-1 flex ${variant === 'compact' ? 'items-center gap-2' : 'flex-col items-center text-center'}`}>
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
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {match.away_team}
            </span>
          )}
        </div>
      </div>

      {/* Match Details */}
      <div className={`flex ${variant === 'compact' ? 'items-center justify-between text-xs' : 'flex-col gap-1.5 text-sm'} text-gray-500`}>
        <div className="flex items-center gap-1">
          <CalendarDays className={`${variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} text-rugby-teal`} />
          <span>
            {format(new Date(match.match_date), variant === 'compact' ? 'MMM d, HH:mm' : 'MMM d, yyyy • HH:mm')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className={`${variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} text-rugby-red`} />
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
            className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-rugby-teal hover:text-rugby-teal/80 transition-colors"
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
            <div className="mt-4 pt-4 border-t border-rugby-teal/20 space-y-4">
              {match.description && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-rugby-teal">Match Summary</h4>
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
          className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 ${
            isLive ? 'ring-2 ring-rugby-red shadow-lg' : 'border-rugby-teal/20'
          } ${variant === 'compact' ? 'p-3' : 'p-4'} hover:border-rugby-teal`}
        >
          {cardContent}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Card>
      </Link>
    );
  }

  // Return without link for non-local matches
  return (
    <Card 
      className={`group relative overflow-hidden hover:shadow-sm transition-all duration-300 border-rugby-teal/20 hover:border-rugby-teal ${
        variant === 'compact' ? 'p-3' : 'p-4'
      }`}
    >
      {cardContent}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </Card>
  );
} 