"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Pencil, Trash2, Users, Calendar, MapPin, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from '@/lib/utils';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

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
  participant_details: Profile[];
}

interface Props {
  activities: Activity[];
}

export default function AdminActivitiesClient({ activities: initialActivities }: Props) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
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
      router.refresh();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getParticipantCount = (activity: Activity) => {
    return activity.participants?.[0]?.count || 0;
  };

  const getCapacityStatus = (activity: Activity) => {
    const count = getParticipantCount(activity);
    const max = activity.max_participants;

    if (!max) return <Badge variant="secondary">No Limit</Badge>;
    if (count >= max) return <Badge variant="destructive">Full</Badge>;
    if (count >= max * 0.8) return <Badge variant="warning">Almost Full</Badge>;
    return <Badge variant="success">Available</Badge>;
  };

  const getActivityStatus = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();
    
    if (activityDate < now) {
      return <Badge variant="secondary">Past</Badge>;
    }
    if (activityDate.toDateString() === now.toDateString()) {
      return <Badge variant="warning">Today</Badge>;
    }
    return <Badge variant="default">Upcoming</Badge>;
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();

  const ParticipantsList = ({ participants }: { participants: Profile[] }) => {
    if (participants.length === 0) {
      return <div className="text-sm text-muted-foreground py-2">No participants yet</div>;
    }

    return (
      <div className="max-h-[400px] overflow-y-auto pr-4 -mr-4">
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div>
                <div className="font-medium">
                  {participant.full_name || 'Unnamed User'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {participant.email}
                </div>
              </div>
              <Badge variant="outline">{index + 1}</Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (activities.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Activities</CardTitle>
                <CardDescription>
                  Manage and organize team activities and events
                </CardDescription>
              </div>
              <Button 
                onClick={() => router.push('/admin/activities/new')}
                className="w-full md:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Activity
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="flex items-center justify-center p-8">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first activity
            </p>
            <Button onClick={() => router.push('/admin/activities/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Activity
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Activities</CardTitle>
              <CardDescription>
                Manage and organize team activities and events
              </CardDescription>
            </div>
            <Button 
              onClick={() => router.push('/admin/activities/new')}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Activity
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Date & Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow 
                  key={activity.id}
                  className={`group transition-colors ${
                    !isUpcoming(activity.date) ? 'text-muted-foreground' : ''
                  }`}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.title}</span>
                        {getActivityStatus(activity.date)}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {activity.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                        {formatDate(activity.date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4 text-rose-500" />
                        {activity.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getCapacityStatus(activity)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedActivity(activity)}
                      >
                        <Users className="h-4 w-4" />
                        {getParticipantCount(activity)} {activity.max_participants ? `/ ${activity.max_participants}` : ''} participants
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        className="hover:text-destructive"
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

      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants for {selectedActivity?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                {getParticipantCount(selectedActivity)} {selectedActivity.max_participants ? `out of ${selectedActivity.max_participants}` : ''} participants
              </div>
              <ParticipantsList participants={selectedActivity.participant_details} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 