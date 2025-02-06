import Image from 'next/image';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Match, MatchEvent, PlayerCard } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchCard from '@/components/features/Matches/MatchCard';

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
            <MatchCard 
              key={`upcoming_${match.id}_${index}`} 
              match={match} 
              isLocalMatch={false} 
              variant="default"
            />
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
            <MatchCard 
              key={`past_${match.id}_${index}`} 
              match={match} 
              isLocalMatch={false} 
              variant="default"
            />
          ))}
          {pastMatches.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No past matches available.</p>
          )}
        </div>
      </section>
    </>
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
    <div className="container-width mx-auto px-4 py-8">
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
                <MatchCard 
                  key={`upcoming_local_${match.id}_${index}`} 
                  match={match} 
                  isLocalMatch={true} 
                  variant="default"
                />
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
                <MatchCard 
                  key={`past_local_${match.id}_${index}`} 
                  match={match} 
                  isLocalMatch={true} 
                  variant="default"
                />
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