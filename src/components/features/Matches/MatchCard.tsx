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
import { useLanguage } from '@/context/LanguageContext';
import MatchCountdownTimer from './MatchCountdownTimer';

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
  const { translations } = useLanguage();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return variant === 'compact' ? 'LIVE' : translations.liveNow || 'LIVE NOW';
      case 'completed':
        return translations.completed || 'Completed';
      case 'scheduled':
        return translations.scheduled || 'Scheduled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const cardContent = (
    <div className="flex flex-col min-h-[200px]">
      {/* Competition & Status */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-rugby-teal text-xs tracking-wide uppercase">
          {match.competition}
        </span>
        <Badge 
          variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
          className={`px-2 py-0.5 text-xs ${
            isLive 
              ? 'animate-pulse bg-rugby-red text-white font-semibold tracking-wider' 
              : isCompleted 
                ? 'bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20 font-medium'
                : 'bg-rugby-teal/10 text-rugby-teal hover:bg-rugby-teal/20 font-medium'
          }`}
        >
          {getStatusText(match.status)}
        </Badge>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-3 mb-auto">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center text-center min-h-[90px]">
          <div className="relative w-12 h-12 mb-2 transition-transform duration-300 hover:scale-105">
            <Image
              src={match.home_team_image}
              alt={match.home_team}
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {match.home_team}
          </span>
        </div>

        {/* Score/VS */}
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          {isCompleted ? (
            <div className="text-lg font-bold text-rugby-teal tracking-tight">
              {match.home_score} - {match.away_score}
            </div>
          ) : isLive ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="text-lg font-bold text-rugby-red tracking-tighter">
                {match.home_score} - {match.away_score}
              </div>
              <span className="text-[10px] font-bold text-rugby-red bg-rugby-red/10 px-2 py-0.5 rounded-full animate-pulse tracking-wider">
                {translations.liveNow || 'LIVE NOW'}
              </span>
            </div>
          ) : (
            <div className="text-base font-semibold text-rugby-teal tracking-widest">VS</div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center text-center min-h-[90px]">
          <div className="relative w-12 h-12 mb-2 transition-transform duration-300 hover:scale-105">
            <Image
              src={match.away_team_image}
              alt={match.away_team}
              fill
              className="object-contain drop-shadow-sm"
            />
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Match Details */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-auto">
        <div className="flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5 text-rugby-teal" />
          <span className="font-medium">
            {format(new Date(match.match_date), 'MMM d • HH:mm')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rugby-teal" />
          <span className="font-medium truncate max-w-[80px]">{match.venue}</span>
        </div>
      </div>
      
      {/* Countdown Timer - show only for upcoming matches */}
      {!isCompleted && !isLive && (
        <div className="mt-2">
          <MatchCountdownTimer matchDate={match.match_date} />
        </div>
      )}

      {/* Expandable Match Details */}
      {hasDetails && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-medium text-rugby-teal hover:text-rugby-teal/80 transition-colors bg-white dark:bg-gray-800 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
          >
            {isExpanded ? (
              <>
                {translations.showLess || 'Show Less'} <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                {translations.showDetails || 'Show Details'} <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-rugby-teal/20 space-y-2">
              {match.description && (
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-rugby-teal flex items-center gap-1">
                    <span className="bg-rugby-teal/10 px-2 py-0.5 rounded">
                      {translations.matchSummary || 'Match Summary'}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
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
    </div>
  );

  // Wrap the card in a link if it's a local match
  if (isLocalMatch) {
    return (
      <div className="match-card-container">
        <Link href={`/matches/${match.id}`} className="block relative">
          <Card 
            className="relative overflow-hidden transition-all duration-300 border-2 border-rugby-teal/30 hover:shadow-xl p-3 backdrop-blur-sm bg-white dark:bg-gray-800/90 rounded-none match-card"
          >
            {/* Card content */}
            <div className="relative z-10">
              {cardContent}
            </div>
            
            {/* Hover overlay - appears on hover */}
            <div className="absolute inset-0 bg-black/10 opacity-0 match-card-overlay transition-opacity duration-300 z-0 pointer-events-none" />
            
            {/* Bottom animated line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow match-card-line" />
          </Card>
        </Link>
        
        <style jsx>{`
          .match-card-container:hover .match-card {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .match-card-container:hover .match-card-overlay {
            opacity: 1;
          }
          .match-card-container:hover .match-card-line {
            transform: scaleX(1);
            transform-origin: center;
          }
          .match-card-line {
            transform: scaleX(0);
            transform-origin: center;
            transition: transform 0.5s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Return without link for non-local matches
  return (
    <div className="match-card-container">
      <Card 
        className="relative overflow-hidden transition-all duration-300 border-2 border-rugby-teal/30 p-3 backdrop-blur-sm bg-white dark:bg-gray-800/90 rounded-none match-card"
      >
        {/* Card content */}
        <div className="relative z-10">
          {cardContent}
        </div>
        
        {/* Hover overlay - appears on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 match-card-overlay transition-opacity duration-300 z-0 pointer-events-none" />
        
        {/* Bottom animated line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow match-card-line" />
      </Card>
      
      <style jsx>{`
        .match-card-container:hover .match-card {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .match-card-container:hover .match-card-overlay {
          opacity: 1;
        }
        .match-card-container:hover .match-card-line {
          transform: scaleX(1);
          transform-origin: center;
        }
        .match-card-line {
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 