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
        <span className={`font-medium text-rugby-teal ${variant === 'compact' ? 'text-xs' : 'text-sm'} tracking-wide uppercase`}>
          {match.competition}
        </span>
        <Badge 
          variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
          className={`${variant === 'compact' ? 'text-xs px-2 py-0.5' : 'px-3 py-1'} ${
            isLive 
              ? 'animate-pulse bg-rugby-red text-white font-semibold tracking-wider' 
              : isCompleted 
                ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20 font-medium'
                : 'bg-rugby-teal/10 text-rugby-teal hover:bg-rugby-teal/20 font-medium'
          }`}
        >
          {isLive ? (variant === 'compact' ? 'LIVE' : 'LIVE NOW') : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </Badge>
      </div>

      {/* Teams & Score */}
      <div className={`flex items-center justify-between ${variant === 'compact' ? 'gap-2' : 'gap-4'} mb-4`}>
        {/* Home Team */}
        <div className={`flex-1 flex ${variant === 'compact' ? 'items-center gap-2' : 'flex-col items-center text-center'}`}>
          <div className={`relative ${variant === 'compact' ? 'w-8 h-8 flex-shrink-0' : 'w-20 h-20 mb-3'} transition-transform duration-300 hover:scale-105`}>
            <Image
              src={match.home_team_image}
              alt={match.home_team}
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
          <span className={`${variant === 'compact' ? 'text-sm truncate' : 'text-base font-semibold text-gray-900 dark:text-gray-100'}`}>
            {match.home_team}
          </span>
        </div>

        {/* Score/VS */}
        <div className="flex flex-col items-center justify-center">
          {isCompleted ? (
            <div className={`${variant === 'compact' ? 'text-base font-semibold' : 'text-2xl font-bold'} text-rugby-teal tracking-tight`}>
              {match.home_score} - {match.away_score}
            </div>
          ) : isLive ? (
            variant === 'compact' ? (
              <span className="text-base font-bold text-rugby-red">
                {match.home_score} - {match.away_score}
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-3xl font-bold text-rugby-red tracking-tighter">
                  {match.home_score} - {match.away_score}
                </div>
                <span className="text-xs font-bold text-rugby-red bg-rugby-red/10 px-3 py-1 rounded-full animate-pulse tracking-wider">
                  LIVE NOW
                </span>
              </div>
            )
          ) : (
            <div className={`text-rugby-yellow ${variant === 'compact' ? 'text-sm font-medium' : 'text-xl font-semibold tracking-widest'}`}>VS</div>
          )}
        </div>

        {/* Away Team */}
        <div className={`flex-1 flex ${variant === 'compact' ? 'items-center gap-2' : 'flex-col items-center text-center'}`}>
          <div className={`relative ${variant === 'compact' ? 'w-8 h-8 flex-shrink-0' : 'w-20 h-20 mb-3'} transition-transform duration-300 hover:scale-105`}>
            <Image
              src={match.away_team_image}
              alt={match.away_team}
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
          <span className={`${variant === 'compact' ? 'text-sm truncate' : 'text-base font-semibold text-gray-900 dark:text-gray-100'}`}>
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Match Details */}
      <div className={`flex ${variant === 'compact' ? 'items-center justify-between text-xs' : 'flex-col gap-2 text-sm'} text-gray-600 dark:text-gray-400`}>
        <div className="flex items-center gap-1.5">
          <CalendarDays className={`${variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-rugby-teal`} />
          <span className="font-medium">
            {format(new Date(match.match_date), variant === 'compact' ? 'MMM d, HH:mm' : 'MMM d, yyyy • HH:mm')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className={`${variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-rugby-red`} />
          <span className={`font-medium ${variant === 'compact' ? 'truncate max-w-[150px]' : ''}`}>{match.venue}</span>
        </div>
      </div>

      {/* Expandable Match Details (only for non-compact view) */}
      {variant !== 'compact' && hasDetails && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-medium text-rugby-teal hover:text-rugby-teal/80 transition-colors bg-rugby-teal/5 hover:bg-rugby-teal/10 py-2 rounded-md"
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
                  <h4 className="font-semibold text-sm text-rugby-teal flex items-center gap-2">
                    <span className="bg-rugby-teal/10 px-2 py-1 rounded-md">Match Summary</span>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
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
      <Link href={`/matches/${match.id}`} className="block group">
        <Card 
          className={`relative overflow-hidden transition-all duration-300 ${
            isLive ? 'ring-2 ring-rugby-red shadow-lg' : 'hover:shadow-lg border-rugby-teal/20'
          } ${variant === 'compact' ? 'p-3' : 'p-4'} hover:border-rugby-teal backdrop-blur-sm`}
        >
          {cardContent}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal via-rugby-yellow to-rugby-teal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </Card>
      </Link>
    );
  }

  // Return without link for non-local matches
  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 border-rugby-teal/20 hover:border-rugby-teal hover:shadow-md ${
        variant === 'compact' ? 'p-3' : 'p-4'
      } backdrop-blur-sm`}
    >
      {cardContent}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal via-rugby-yellow to-rugby-teal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
    </Card>
  );
} 