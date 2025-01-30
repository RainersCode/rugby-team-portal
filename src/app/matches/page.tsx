import Image from 'next/image';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import { Match } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function MatchCard({ match }: { match: Match }) {
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';
  const isApiMatch = match.id.toString().length > 5; // API matches have longer IDs
  
  if (isApiMatch) {
    // Compact style for API rugby matches
    return (
      <Card className="overflow-hidden hover:shadow-sm transition-all duration-300">
        <div className="p-3">
          {/* Competition & Status */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-primary-blue">
              {match.competition}
            </span>
            <Badge 
              variant={isLive ? "destructive" : isCompleted ? "secondary" : "default"}
              className={`text-xs px-2 py-0.5 ${isLive ? 'animate-pulse bg-red-500 text-white' : ''}`}
            >
              {isLive ? 'LIVE' : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </Badge>
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={match.home_team_image}
                  alt={match.home_team}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm truncate">{match.home_team}</span>
            </div>

            {/* Score/VS */}
            <div className="flex items-center justify-center min-w-[40px]">
              {isCompleted ? (
                <span className="text-sm font-medium">
                  {match.home_score} - {match.away_score}
                </span>
              ) : isLive ? (
                <span className="text-sm font-bold text-red-500">
                  {match.home_score} - {match.away_score}
                </span>
              ) : (
                <span className="text-sm text-gray-500">vs</span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center gap-2 justify-end">
              <span className="text-sm truncate">{match.away_team}</span>
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={match.away_team_image}
                  alt={match.away_team}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              <span>{format(new Date(match.match_date), 'MMM d, HH:mm')}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{match.venue}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Original style for database matches
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
  let rugbyMatches: Match[] = [];
  let databaseMatches: Match[] = [];
  let errorMessage: string | null = null;
  
  try {
    // Get the base URL from the environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Fetch rugby matches from API
    const rugbyMatchesResponse = await fetch(new URL('/api/rugby', baseUrl), {
      cache: 'no-store'
    });
    
    if (rugbyMatchesResponse.ok) {
      const data = await rugbyMatchesResponse.json();
      rugbyMatches = data;
    } else {
      const errorText = await rugbyMatchesResponse.text();
      console.error('Failed to fetch rugby matches:', errorText);
      errorMessage = `Failed to fetch rugby matches: ${errorText}`;
    }

    // Fetch matches from database
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const { data: dbMatches, error: dbError } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (dbError) {
      console.error('Error fetching database matches:', dbError);
    } else {
      databaseMatches = dbMatches || [];
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    errorMessage = 'Error fetching matches. Please try again later.';
  }

  const now = new Date();
  
  // Process API rugby matches
  const upcomingRugbyMatches = rugbyMatches
    .filter((match: Match) => 
      (new Date(match.match_date) > now && match.status === 'upcoming') || 
      match.status === 'live'
    )
    .sort((a: Match, b: Match) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  const pastRugbyMatches = rugbyMatches
    .filter((match: Match) => match.status === 'completed')
    .sort((a: Match, b: Match) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

  // Process database matches
  const upcomingDbMatches = databaseMatches
    .filter((match: Match) => 
      (new Date(match.match_date) > now && match.status === 'upcoming') || 
      match.status === 'live'
    )
    .sort((a: Match, b: Match) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

  const pastDbMatches = databaseMatches
    .filter((match: Match) => match.status === 'completed')
    .sort((a: Match, b: Match) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
          <TabsTrigger 
            value="local" 
            className="text-base data-[state=active]:bg-primary-blue data-[state=active]:text-white"
          >
            Local Matches
          </TabsTrigger>
          <TabsTrigger 
            value="rugby" 
            className="text-base data-[state=active]:bg-primary-blue data-[state=active]:text-white"
          >
            World Rugby
          </TabsTrigger>
        </TabsList>

        {/* Local Database Matches */}
        <TabsContent value="local">
          {/* Upcoming Local Matches */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Upcoming Local Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingDbMatches.map((match: Match, index: number) => (
                <MatchCard key={`upcoming_local_${match.id}_${index}`} match={match} />
              ))}
              {upcomingDbMatches.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No upcoming local matches scheduled.</p>
              )}
            </div>
          </section>

          {/* Past Local Matches */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Past Local Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastDbMatches.map((match: Match, index: number) => (
                <MatchCard key={`past_local_${match.id}_${index}`} match={match} />
              ))}
              {pastDbMatches.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400">No past local matches available.</p>
              )}
            </div>
          </section>
        </TabsContent>

        {/* API Rugby Matches */}
        <TabsContent value="rugby">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex flex-wrap gap-2 mb-8">
              <TabsTrigger value="all">All Leagues</TabsTrigger>
              <TabsTrigger value="premiership">Premiership Rugby</TabsTrigger>
              <TabsTrigger value="top14">Top 14</TabsTrigger>
              <TabsTrigger value="urc">United Rugby Championship</TabsTrigger>
              <TabsTrigger value="super">Super Rugby</TabsTrigger>
              <TabsTrigger value="champions">Champions Cup</TabsTrigger>
            </TabsList>

            {/* All Leagues Tab */}
            <TabsContent value="all">
              <RugbyLeagueSection
                title="World Rugby"
                upcomingMatches={upcomingRugbyMatches}
                pastMatches={pastRugbyMatches}
              />
            </TabsContent>

            {/* Premiership Rugby Tab */}
            <TabsContent value="premiership">
              <RugbyLeagueSection
                title="Premiership Rugby"
                upcomingMatches={upcomingRugbyMatches.filter(m => m.competition.includes('Premiership'))}
                pastMatches={pastRugbyMatches.filter(m => m.competition.includes('Premiership'))}
              />
            </TabsContent>

            {/* Top 14 Tab */}
            <TabsContent value="top14">
              <RugbyLeagueSection
                title="Top 14"
                upcomingMatches={upcomingRugbyMatches.filter(m => m.competition.includes('Top 14'))}
                pastMatches={pastRugbyMatches.filter(m => m.competition.includes('Top 14'))}
              />
            </TabsContent>

            {/* United Rugby Championship Tab */}
            <TabsContent value="urc">
              <RugbyLeagueSection
                title="United Rugby Championship"
                upcomingMatches={upcomingRugbyMatches.filter(m => m.competition.includes('United Rugby'))}
                pastMatches={pastRugbyMatches.filter(m => m.competition.includes('United Rugby'))}
              />
            </TabsContent>

            {/* Super Rugby Tab */}
            <TabsContent value="super">
              <RugbyLeagueSection
                title="Super Rugby"
                upcomingMatches={upcomingRugbyMatches.filter(m => m.competition.includes('Super Rugby'))}
                pastMatches={pastRugbyMatches.filter(m => m.competition.includes('Super Rugby'))}
              />
            </TabsContent>

            {/* Champions Cup Tab */}
            <TabsContent value="champions">
              <RugbyLeagueSection
                title="European Rugby Champions Cup"
                upcomingMatches={upcomingRugbyMatches.filter(m => m.competition.includes('Champions Cup'))}
                pastMatches={pastRugbyMatches.filter(m => m.competition.includes('Champions Cup'))}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RugbyLeagueSection({ 
  title, 
  upcomingMatches, 
  pastMatches 
}: { 
  title: string;
  upcomingMatches: Match[];
  pastMatches: Match[];
}) {
  return (
    <>
      {/* Upcoming Matches */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Upcoming {title} Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingMatches.map((match: Match, index: number) => (
            <MatchCard key={`upcoming_${match.id}_${index}`} match={match} />
          ))}
          {upcomingMatches.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No upcoming matches scheduled.</p>
          )}
        </div>
      </section>

      {/* Past Matches */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Past {title} Matches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastMatches.map((match: Match, index: number) => (
            <MatchCard key={`past_${match.id}_${index}`} match={match} />
          ))}
          {pastMatches.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No past matches available.</p>
          )}
        </div>
      </section>
    </>
  );
} 