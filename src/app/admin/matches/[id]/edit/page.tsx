'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MatchForm from '@/components/features/Matches/MatchForm';
import { use } from 'react';

interface EditMatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMatchPage({ params }: EditMatchPageProps) {
  const { id } = use(params);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role !== 'admin') {
          router.push('/');
          return;
        }

        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();

        if (matchError) throw matchError;
        if (!match) throw new Error('Match not found');

        setMatch(match);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load match');
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [id, router, supabase]);

  const handleSubmit = async (formData: any) => {
    setSaving(true);
    setError(null);

    try {
      // Get the current match data to compare images
      const { data: currentMatch } = await supabase
        .from('matches')
        .select('home_team_image, away_team_image')
        .eq('id', id)
        .single();

      // Delete old images if they've been changed
      const imagesToDelete = [];
      if (currentMatch?.home_team_image && currentMatch.home_team_image !== formData.home_team_image) {
        imagesToDelete.push(getImagePathFromUrl(currentMatch.home_team_image));
      }
      if (currentMatch?.away_team_image && currentMatch.away_team_image !== formData.away_team_image) {
        imagesToDelete.push(getImagePathFromUrl(currentMatch.away_team_image));
      }

      // Delete old images from storage
      if (imagesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('articles')
          .remove(imagesToDelete.filter(Boolean) as string[]);

        if (storageError) {
          console.error('Error deleting old images:', storageError);
        }
      }

      // Update the match
      const { error: updateError } = await supabase
        .from('matches')
        .update(formData)
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/admin/matches');
      router.refresh();
    } catch (error) {
      console.error('Error updating match:', error);
      setError(error instanceof Error ? error.message : 'Failed to update match');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!match) return <div>Match not found</div>;

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Match</h1>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <MatchForm
        initialData={match}
        onSubmit={handleSubmit}
        isSubmitting={saving}
      />
    </Card>
  );
}

function getImagePathFromUrl(url: string): string | null {
  if (!url) return null;
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