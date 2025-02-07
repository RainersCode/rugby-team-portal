"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
  participants: { count: number }[];
}

interface Props {
  activities: Activity[];
}

export default function AdminActivitiesClient({ activities: initialActivities }: Props) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this activity?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setActivities(activities.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getParticipantCount = (activity: Activity) => {
    return activity.participants?.[0]?.count || 0;
  };

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-center mb-6">
          <CardTitle className="text-2xl font-bold">Activities</CardTitle>
          <Button onClick={() => router.push('/admin/activities/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.title}</TableCell>
                <TableCell>{formatDate(activity.date)}</TableCell>
                <TableCell>{activity.location}</TableCell>
                <TableCell>
                  {getParticipantCount(activity)} / {activity.max_participants || '∞'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/activities/${activity.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 