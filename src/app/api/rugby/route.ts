import { NextResponse } from 'next/server';
import { fetchRugbyMatches } from '@/lib/sportsdb';

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;
let cachedData: any = null;
let lastFetch: number = 0;

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (cachedData && (now - lastFetch) / 1000 < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Fetch fresh data
    const matches = await fetchRugbyMatches();
    
    // Update cache
    cachedData = matches;
    lastFetch = now;

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error in rugby API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rugby matches' },
      { status: 500 }
    );
  }
} 