import { Match } from '@/types';

// Free tier API key
const SPORTSDB_API_KEY = '3';
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

export async function fetchRugbyMatches(): Promise<Match[]> {
  const API_KEY = '3';
  const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

  // Top rugby leagues to search for
  const RUGBY_LEAGUES = [
    'Premiership_Rugby',
    'Top_14',
    'United_Rugby_Championship',
    'Super_Rugby',
    'European_Rugby_Champions_Cup'
  ];

  try {
    // Fetch matches from each league
    const leagueMatches = await Promise.all(
      RUGBY_LEAGUES.map(async (leagueName) => {
        console.log(`Searching for matches in ${leagueName}...`);
        
        // Search for both upcoming and recent matches
        const response = await fetch(
          `${BASE_URL}/${API_KEY}/searchfilename.php?e=${leagueName}_2024`
        );

        if (!response.ok) {
          console.error(`Failed to fetch matches for ${leagueName}`);
          return [];
        }

        const data = await response.json();
        console.log(`Found ${data.event?.length || 0} matches for ${leagueName}`);
        
        return data.event || [];
      })
    );

    // Flatten and deduplicate matches
    const allMatches = leagueMatches.flat();
    const uniqueMatches = Array.from(new Map(allMatches.map(match => [match.idEvent, match])).values());

    console.log('Total unique matches found:', uniqueMatches.length);

    // Transform to Match type
    const transformedMatches = uniqueMatches
      .filter(match => match.strSport === 'Rugby' || match.strSport === 'Rugby Union')
      .map(match => ({
        id: match.idEvent,
        home_team: match.strHomeTeam,
        away_team: match.strAwayTeam,
        home_team_image: match.strHomeTeamBadge || '/placeholder-team.png',
        away_team_image: match.strAwayTeamBadge || '/placeholder-team.png',
        match_date: match.strTimestamp || match.dateEvent,
        venue: match.strVenue || 'TBD',
        competition: match.strLeague,
        home_score: match.intHomeScore ? parseInt(match.intHomeScore) : undefined,
        away_score: match.intAwayScore ? parseInt(match.intAwayScore) : undefined,
        status: getMatchStatus(match)
      }));

    console.log('Final transformed matches:', transformedMatches.length);
    return transformedMatches;
  } catch (error) {
    console.error('Error fetching rugby matches:', error);
    return [];
  }
}

function getMatchStatus(match: any): 'upcoming' | 'live' | 'completed' {
  // Check if the match is live
  if (match.strStatus?.toLowerCase() === 'live' || 
      match.strStatus?.toLowerCase()?.includes('playing')) {
    return 'live';
  }

  // Check if the match is completed
  if (match.strStatus?.toLowerCase() === 'finished' || 
      match.strStatus?.toLowerCase() === 'ft' ||
      match.strStatus?.toLowerCase()?.includes('ended') ||
      (match.intHomeScore !== null && match.intAwayScore !== null)) {
    return 'completed';
  }

  // Default to upcoming
  return 'upcoming';
} 