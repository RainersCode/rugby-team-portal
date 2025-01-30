import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_image: string;
  away_team_image: string;
  match_date: string;
  venue: string;
  competition: string;
  home_score?: number;
  away_score?: number;
  status: 'upcoming' | 'live' | 'completed';
}

function MatchCard({ match }: { match: Match }) {
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';
  
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${
      isLive ? 'ring-2 ring-red-500 shadow-lg' : ''
    }`}>
      {/* Competition & Status */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 flex justify-between items-center border-b">
        <span className="text-sm font-medium text-primary-blue">
          {match.competition}
        </span>
        <Badge 
          variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
          className={isLive ? 'animate-pulse bg-red-500 text-white' : ''}
        >
          {isLive ? 'LIVE NOW' : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </Badge>
      </div>

      <div className="p-4">
        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src={match.home_team_image}
                alt={match.home_team}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{match.home_team}</h3>
            {isLive && (
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {match.home_score}
              </div>
            )}
          </div>

          {/* Score/VS */}
          <div className="flex flex-col items-center justify-center min-w-[80px]">
            {isCompleted ? (
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {match.home_score} - {match.away_score}
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl font-bold text-red-500">
                  {match.home_score} - {match.away_score}
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
            ) : (
              <div className="text-lg font-medium text-gray-500">VS</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src={match.away_team_image}
                alt={match.away_team}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{match.away_team}</h3>
            {isLive && (
              <div className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {match.away_score}
              </div>
            )}
          </div>
        </div>

        {/* Match Details */}
        <div className="flex flex-col gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{format(new Date(match.match_date), 'MMM d, yyyy • HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return <div>Failed to load matches</div>;
  }

  const now = new Date();
  const upcomingMatches = matches?.filter(
    match => new Date(match.match_date) > now || match.status === 'live'
  ) || [];
  const pastMatches = matches?.filter(
    match => new Date(match.match_date) <= now && match.status === 'completed'
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Upcoming Matches */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Upcoming Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {upcomingMatches.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No upcoming matches scheduled.</p>
          )}
        </div>
      </section>

      {/* Past Matches */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Past Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {pastMatches.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No past matches available.</p>
          )}
        </div>
      </section>
    </div>
  );
} 