"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  targetTime?: string;
}

export default function CountdownTimer({ targetDate, targetTime = '00:00' }: CountdownTimerProps) {
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
    // Parse the target date and time
    const [hours, minutes] = (targetTime || '00:00').split(':').map(Number);
    const targetDateTime = new Date(targetDate);
    targetDateTime.setHours(hours || 0, minutes || 0, 0, 0);

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
  }, [targetDate, targetTime]);

  // Skip rendering if expired
  if (timeRemaining.isExpired) {
    return (
      <div className="flex items-center text-sm font-medium text-yellow-600 dark:text-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/30 px-3 py-2 rounded-sm">
        <Clock className="w-4 h-4 mr-2" />
        {language === 'en' ? 'Started' : 'Sākās'}
      </div>
    );
  }

  // Format the time units with leading zeros
  const formatTimeUnit = (value: number): string => value.toString().padStart(2, '0');

  return (
    <div className="flex items-start gap-1 text-xs font-medium bg-rugby-teal/10 dark:bg-rugby-teal/20 px-3 py-2 rounded-sm mt-3">
      <Clock className="w-4 h-4 mr-1 text-rugby-teal mt-0.5" />
      <div>
        <div className="text-gray-500 dark:text-gray-400 mb-1">
          {language === 'en' ? 'Starts in:' : 'Sākas pēc:'}
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