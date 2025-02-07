"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
        const { error } = await supabase
          .from('activity_participants')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('activity_participants')
          .insert([{ activity_id: activityId, user_id: userId }]);

        if (error) throw error;
      }

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

  const getParticipationStatus = (activity: Activity) => {
    if (activity.is_participating) {
      return {
        badge: <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">You're In!</Badge>,
        button: {
          variant: "destructive" as const,
          text: "Cancel Participation",
        }
      };
    }
    if (isActivityFull(activity)) {
      return {
        badge: <Badge variant="destructive">Full</Badge>,
        button: {
          variant: "outline" as const,
          text: "Activity Full",
          disabled: true
        }
      };
    }
    return {
      badge: <Badge variant="secondary">Spots Available</Badge>,
      button: {
        variant: "default" as const,
        text: "Join Activity",
      }
    };
  };

  if (activities.length === 0) {
    return (
      <div className="container-width mx-auto px-4 py-16">
        <Card className="text-center p-8">
          <CardContent>
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Upcoming Activities</h3>
            <p className="text-muted-foreground">
              Check back later for new activities or contact the team for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-width mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Upcoming Activities
        </h1>
        <p className="text-muted-foreground text-lg">
          Join our team activities and events. Stay active and connected with the community.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => {
          const status = getParticipationStatus(activity);
          const activityDate = new Date(activity.date);
          const isUpcoming = activityDate > new Date();

          return (
            <Card 
              key={activity.id} 
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg
                ${isUpcoming ? 'border-blue-500/20' : 'border-gray-500/20'}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none" />
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  {status.badge}
                  <span className="text-sm text-muted-foreground">
                    {activity.participant_count} {activity.max_participants ? `/ ${activity.max_participants}` : ''} participants
                  </span>
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-blue-500 transition-colors">
                  {activity.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {activity.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                    <time dateTime={activity.date} className="text-muted-foreground">
                      {formatDate(activity.date)}
                    </time>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-rose-500" />
                    <span className="text-muted-foreground">{activity.location}</span>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full group relative"
                      variant={status.button.variant}
                      disabled={status.button.disabled}
                      onClick={() => handleParticipation(activity.id, activity.is_participating)}
                    >
                      {status.button.text}
                      <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Card>
          );
        })}
      </div>
    </div>
  );
} 