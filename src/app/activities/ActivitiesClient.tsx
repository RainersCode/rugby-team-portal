"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number | null;
  participant_count: number;
  is_participating: boolean;
}

interface Props {
  activities: Activity[];
  userId?: string;
}

export default function ActivitiesClient({ activities: initialActivities, userId }: Props) {
  const [activities, setActivities] = useState(initialActivities);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleParticipation = async (activityId: string, isParticipating: boolean) => {
    if (!userId) {
      router.push('/auth/signin');
      return;
    }

    try {
      if (isParticipating) {
        // Remove participation
        const { error } = await supabase
          .from('activity_participants')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Add participation
        const { error } = await supabase
          .from('activity_participants')
          .insert([{ activity_id: activityId, user_id: userId }]);

        if (error) throw error;
      }

      // Update local state
      setActivities(activities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            is_participating: !isParticipating,
            participant_count: isParticipating
              ? activity.participant_count - 1
              : activity.participant_count + 1
          };
        }
        return activity;
      }));

      router.refresh();
    } catch (error) {
      console.error('Error updating participation:', error);
    }
  };

  const isActivityFull = (activity: Activity) => {
    return activity.max_participants !== null && activity.participant_count >= activity.max_participants;
  };

  if (activities.length === 0) {
    return (
      <div className="container-width mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No upcoming activities scheduled.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-width mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upcoming Activities</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{activity.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {activity.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(activity.date)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {activity.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {activity.participant_count} {activity.max_participants ? `/ ${activity.max_participants}` : ''} participants
                </div>
                <Button
                  className="w-full"
                  variant={activity.is_participating ? "destructive" : "default"}
                  disabled={!activity.is_participating && isActivityFull(activity)}
                  onClick={() => handleParticipation(activity.id, activity.is_participating)}
                >
                  {activity.is_participating
                    ? "Cancel Participation"
                    : isActivityFull(activity)
                    ? "Activity Full"
                    : "Join Activity"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 