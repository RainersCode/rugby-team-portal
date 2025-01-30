import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

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
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Competition & Date */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-primary-blue">
            {match.competition}
          </span>
          <div className="text-sm text-gray-600">
            {format(new Date(match.match_date), 'MMM d, yyyy • HH:mm')}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <Image
                src={match.home_team_image}
                alt={match.home_team}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-semibold text-secondary-navy">{match.home_team}</h3>
          </div>

          {/* Score/VS */}
          <div className="flex items-center justify-center px-4">
            {isCompleted ? (
              <div className="text-2xl font-bold text-secondary-navy">
                {match.home_score} - {match.away_score}
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-primary-blue mb-1">
                  {match.home_score} - {match.away_score}
                </div>
                <span className="text-sm font-semibold text-red-500 animate-pulse">
                  LIVE
                </span>
              </div>
            ) : (
              <div className="text-xl font-semibold text-gray-600">VS</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <Image
                src={match.away_team_image}
                alt={match.away_team}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="font-semibold text-secondary-navy">{match.away_team}</h3>
          </div>
        </div>

        {/* Venue */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {match.venue}
        </div>

        {/* Status Indicator */}
        {match.status === 'upcoming' && (
          <div className="mt-4 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-primary-blue text-sm font-semibold rounded-full">
              Upcoming
            </span>
          </div>
        )}
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
    <div className="container-width py-8">
      {/* Upcoming Matches */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-secondary-navy mb-6">
          Upcoming Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Past Matches */}
      <section>
        <h2 className="text-3xl font-bold text-secondary-navy mb-6">
          Past Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </div>
  );
} 