'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  competition: string;
  status: 'upcoming' | 'live' | 'completed';
  home_score?: number;
  away_score?: number;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Error loading matches');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) {
      return;
    }

    try {
      // First get the match data to get image URLs
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('home_team_image, away_team_image')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete images from storage if they exist
      if (match) {
        const imagesToDelete = [
          getImagePathFromUrl(match.home_team_image),
          getImagePathFromUrl(match.away_team_image)
        ].filter(Boolean) as string[];

        if (imagesToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('articles')
            .remove(imagesToDelete);

          if (storageError) {
            console.error('Error deleting images:', storageError);
          }
        }
      }

      // Then delete the match
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Refresh the matches list
      loadMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Matches</h1>
        <Button asChild>
          <Link href="/admin/matches/new">Add Match</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teams</TableHead>
            <TableHead>Competition</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Venue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell>
                {match.home_team} vs {match.away_team}
              </TableCell>
              <TableCell>{match.competition}</TableCell>
              <TableCell>
                {format(new Date(match.match_date), 'MMM d, yyyy • HH:mm')}
              </TableCell>
              <TableCell>{match.venue}</TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(match.status)}
                >
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {match.status !== 'upcoming' 
                  ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
                  : '-'
                }
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <Link href={`/admin/matches/${match.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(match.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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