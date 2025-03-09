"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock } from 'lucide-react';

interface MatchCountdownTimerProps {
  matchDate: string;
  compact?: boolean;
}

export default function MatchCountdownTimer({ matchDate, compact = false }: MatchCountdownTimerProps) {
  const { language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    // Parse the match date
    const targetDateTime = new Date(matchDate);
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = targetDateTime.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Timer expired
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        return;
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Set up interval to update the countdown
    const interval = setInterval(calculateTimeRemaining, 1000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [matchDate]);

  // Skip rendering if expired
  if (timeRemaining.isExpired) {
    return compact ? (
      <div className="flex items-center text-[8px] md:text-xs font-medium text-yellow-600 bg-yellow-100/50 px-2 py-0.5 rounded-none">
        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
        {language === 'en' ? 'Live Now' : 'Tiešraide'}
      </div>
    ) : (
      <div className="flex items-center text-sm font-medium text-yellow-600 dark:text-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/30 px-3 py-2 rounded-sm">
        <Clock className="w-4 h-4 mr-2" />
        {language === 'en' ? 'Live Now' : 'Tiešraide'}
      </div>
    );
  }

  // Format the time units with leading zeros
  const formatTimeUnit = (value: number): string => value.toString().padStart(2, '0');

  // Compact version for the hero carousel
  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[8px] md:text-xs font-medium bg-rugby-teal/10 px-1.5 py-0.5 rounded-none mt-0.5">
        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-rugby-teal" />
        <div className="text-rugby-teal">
          {timeRemaining.days > 0 ? (
            <span>
              {timeRemaining.days}{language === 'en' ? 'd' : 'd'} {formatTimeUnit(timeRemaining.hours)}h
            </span>
          ) : (
            <span>
              {formatTimeUnit(timeRemaining.hours)}:{formatTimeUnit(timeRemaining.minutes)}:{formatTimeUnit(timeRemaining.seconds)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full version for other places
  return (
    <div className="flex items-start gap-1 text-xs font-medium bg-rugby-teal/10 dark:bg-rugby-teal/20 px-3 py-2 rounded-sm mt-3">
      <Clock className="w-4 h-4 mr-1 text-rugby-teal mt-0.5" />
      <div>
        <div className="text-gray-500 dark:text-gray-400 mb-1">
          {language === 'en' ? 'Match starts in:' : 'Spēle sākas pēc:'}
        </div>
        <div className="flex items-center gap-2 text-sm text-rugby-teal">
          {timeRemaining.days > 0 && (
            <div className="flex flex-col items-center">
              <span className="font-bold">{timeRemaining.days}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'en' 
                  ? timeRemaining.days === 1 ? 'day' : 'days'
                  : 'dienas'}
              </span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="font-bold">{formatTimeUnit(timeRemaining.hours)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'hrs' : 'st.'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">{formatTimeUnit(timeRemaining.minutes)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'min' : 'min.'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">{formatTimeUnit(timeRemaining.seconds)}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'en' ? 'sec' : 'sek.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 