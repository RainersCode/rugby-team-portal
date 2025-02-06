import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import { Match } from '@/types';
import MatchCard from '@/components/features/Matches/MatchCard';
import { MatchEventList, PlayerCardList } from '@/components/features/Matches/MatchDetails';

export const dynamic = 'force-dynamic';

async function getMatch(id: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !match) {
    return null;
  }

  return match as Match;
}

async function getRelatedMatches() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const now = new Date();

  // Get upcoming matches
  const { data: upcomingMatches = [] } = await supabase
    .from('matches')
    .select('*')
    .gt('match_date', now.toISOString())
    .order('match_date', { ascending: true })
    .limit(5);

  // Get recent past matches
  const { data: pastMatches = [] } = await supabase
    .from('matches')
    .select('*')
    .lt('match_date', now.toISOString())
    .order('match_date', { ascending: false })
    .limit(5);

  return {
    upcomingMatches,
    pastMatches
  };
}

export default async function MatchDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const match = await getMatch(params.id);
  if (!match) {
    notFound();
  }

  const { upcomingMatches, pastMatches } = await getRelatedMatches();
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content - 2/3 width */}
        <div className="lg:w-2/3 p-6 lg:border-r border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Match Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold text-primary-blue">
                    {match.competition}
                  </h1>
                  <Badge 
                    variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
                    className={isLive ? 'animate-pulse bg-red-500 text-white' : ''}
                  >
                    {isLive ? 'LIVE NOW' : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{format(new Date(match.match_date), 'PPP • HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{match.venue}</span>
                  </div>
                </div>
              </div>

              {/* Teams & Score */}
              <div className="p-8">
                <div className="flex items-center justify-between gap-8">
                  {/* Home Team */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                      <Image
                        src={match.home_team_image}
                        alt={match.home_team}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {match.home_team}
                    </h2>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    {isCompleted || isLive ? (
                      <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 space-x-6">
                        <span>{match.home_score}</span>
                        <span className="text-gray-400">-</span>
                        <span>{match.away_score}</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-medium text-gray-500">VS</div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 mb-4">
                      <Image
                        src={match.away_team_image}
                        alt={match.away_team}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {match.away_team}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Details */}
            {match.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Match Summary</h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {match.description}
                </p>
              </div>
            )}

            {/* Match Events */}
            {match.match_events?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <MatchEventList events={match.match_events} />
              </div>
            )}

            {/* Player Cards */}
            {match.player_cards?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <PlayerCardList cards={match.player_cards} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:w-1/3 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="sticky top-6 space-y-8">
            {/* Upcoming Matches */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Upcoming Matches
              </h3>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isLocalMatch={true}
                    variant="compact"
                  />
                ))}
                {upcomingMatches.length === 0 && (
                  <p className="text-gray-500">No upcoming matches scheduled.</p>
                )}
              </div>
            </div>

            {/* Recent Matches */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Recent Matches
              </h3>
              <div className="space-y-3">
                {pastMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isLocalMatch={true}
                    variant="compact"
                  />
                ))}
                {pastMatches.length === 0 && (
                  <p className="text-gray-500">No past matches available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 