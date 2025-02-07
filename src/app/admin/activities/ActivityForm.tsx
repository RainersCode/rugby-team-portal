"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Activity {
  id?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number | null;
}

interface Props {
  activity?: Activity;
}

export default function ActivityForm({ activity }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Activity>({
    title: activity?.title || '',
    description: activity?.description || '',
    date: activity?.date ? new Date(activity.date).toISOString().slice(0, 16) : '',
    location: activity?.location || '',
    max_participants: activity?.max_participants || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        max_participants: formData.max_participants || null,
      };

      if (activity?.id) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update(data)
          .eq('id', activity.id);

        if (error) throw error;
      } else {
        // Create new activity
        const { error } = await supabase
          .from('activities')
          .insert([data]);

        if (error) throw error;
      }

      router.push('/admin/activities');
      router.refresh();
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date and Time</Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_participants">Maximum Participants (optional)</Label>
          <Input
            id="max_participants"
            type="number"
            min="1"
            value={formData.max_participants || ''}
            onChange={(e) => setFormData({
              ...formData,
              max_participants: e.target.value ? parseInt(e.target.value) : null
            })}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/activities')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
} 