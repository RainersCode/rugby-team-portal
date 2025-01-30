'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MatchForm from '@/components/features/Matches/MatchForm';

export default function NewMatchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        router.push('/login');
        return;
      }

      // Check admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      // Create the match
      const { error: insertError } = await supabase
        .from('matches')
        .insert(formData);

      if (insertError) throw insertError;

      router.push('/admin/matches');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Match</h1>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <MatchForm
        onSubmit={handleSubmit}
        isSubmitting={loading}
      />
    </Card>
  );
} 