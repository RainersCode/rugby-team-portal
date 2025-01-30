import { Match } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

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
            className="text-primary-blue hover:text-primary-blue/80 font-medium transition-colors"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {upcomingMatches.map((match) => (
                <Card 
                  key={match.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-6">
                      {/* Home Team */}
                      <div className="flex-1 flex flex-col items-center text-center">
                        <div className="relative w-16 h-16 mb-3">
                          <Image
                            src={match.home_team_image}
                            alt={match.home_team}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {match.home_team}
                        </h3>
                      </div>

                      {/* Match Info */}
                      <div className="flex flex-col items-center justify-center px-4">
                        <Badge variant="outline" className="mb-2">Upcoming</Badge>
                        <div className="text-xl font-bold text-gray-400">VS</div>
                        <div className="mt-2 text-sm text-gray-500">
                          {format(new Date(match.match_date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm font-medium text-primary-blue">
                          {format(new Date(match.match_date), 'HH:mm')}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{match.venue}</span>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex flex-col items-center text-center">
                        <div className="relative w-16 h-16 mb-3">
                          <Image
                            src={match.away_team_image}
                            alt={match.away_team}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {match.away_team}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Completed Matches */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {completedMatches.map((match) => (
              <Card 
                key={match.id} 
                className="overflow-hidden hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800"
              >
                <div className="p-4">
                  {/* Competition & Date */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-medium text-primary-blue">
                      {match.competition}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(match.match_date), 'MMM d')}
                    </span>
                  </div>

                  {/* Teams & Score */}
                  <div className="space-y-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={match.home_team_image}
                            alt={match.home_team}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {match.home_team}
                        </span>
                      </div>
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {match.home_score}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={match.away_team_image}
                            alt={match.away_team}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {match.away_team}
                        </span>
                      </div>
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {match.away_score}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                    <Badge variant="secondary" className="text-xs">
                      Full Time
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 