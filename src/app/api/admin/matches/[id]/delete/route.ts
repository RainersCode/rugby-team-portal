import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if the requester is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: adminCheck } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminCheck || adminCheck.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the match first to get image URLs
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Delete team logos from storage
    const imagePaths = [
      getImagePathFromUrl(match.home_team_image),
      getImagePathFromUrl(match.away_team_image),
    ].filter(Boolean) as string[];

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('articles')
        .remove(imagePaths);

      if (storageError) {
        console.error('Error deleting images:', storageError);
      }
    }

    // Delete the match
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete match' },
      { status: 500 }
    );
  }
}

function getImagePathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/article-images\/([^?]+)/);
    if (match) {
      return `article-images/${match[1]}`;
    }
    return null;
  } catch (error) {
    console.error('Error extracting image path:', error);
    return null;
  }
} 