import { Match } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';
import MatchCard from './MatchCard';

interface LatestMatchesProps {
  upcomingMatches: Match[];
  completedMatches: Match[];
}

export default function LatestMatches({ upcomingMatches, completedMatches }: LatestMatchesProps) {
  return (
    <section className="bg-gray-50 dark:bg-gray-800/50">
      <div className="container-width py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Latest Matches
          </h2>
          <Link 
            href="/matches" 
            className="text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors"
          >
            View all matches →
          </Link>
        </div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Upcoming Matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {upcomingMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLocalMatch={true}
                  variant="default"
                />
              ))}
            </div>
          </>
        )}

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Matches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLocalMatch={true}
                  variant="default"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
} 