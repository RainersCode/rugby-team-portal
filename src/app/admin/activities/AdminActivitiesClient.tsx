"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Clock,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import CustomCalendar from "@/components/features/Calendar/CustomCalendar";
import Link from "next/link";
import { format } from "date-fns";

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
  userId: string;
}

export default function AdminActivitiesClient({
  activities: initialActivities,
  userId,
}: Props) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadParticipantDetails() {
      if (!activities || activities.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const enrichedActivities = [...activities];
        
        for (let i = 0; i < enrichedActivities.length; i++) {
          const activity = enrichedActivities[i];
          
          try {
            const { count, error: countError } = await supabase
              .from('activity_participants')
              .select('*', { count: 'exact', head: true })
              .eq('activity_id', activity.id);
              
            if (!countError) {
              activity.participants = [{ count: count || 0 }];
            }
            
            if (count && count > 0) {
              const { data: participants, error: participantsError } = await supabase
                .from('activity_participants')
                .select('user_id')
                .eq('activity_id', activity.id);
                
              if (!participantsError && participants) {
                activity.participant_details = participants;
              }
            }
          } catch (activityError) {
            console.error(`Error processing activity ${activity.id}:`, activityError);
          }
          
          if (i % 3 === 0 || i === enrichedActivities.length - 1) {
            setActivities([...enrichedActivities]);
          }
          
          if (i < enrichedActivities.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setActivities(enrichedActivities);
      } catch (error) {
        console.error('Error loading participant details:', error);
        setError('Failed to load participant details');
      } finally {
        setLoading(false);
      }
    }
    
    loadParticipantDetails();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);

      if (error) throw error;

      setActivities(activities.filter((activity) => activity.id !== id));
      router.refresh();
    } catch (error) {
      console.error("Error deleting activity:", error);
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
    if (count >= max * 0.8)
      return <Badge variant="secondary">Almost Full</Badge>;
    return <Badge variant="outline">Available</Badge>;
  };

  const getActivityStatus = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();

    if (activityDate < now) {
      return <Badge variant="secondary">Past</Badge>;
    }
    if (activityDate.toDateString() === now.toDateString()) {
      return <Badge variant="secondary">Today</Badge>;
    }
    return <Badge variant="default">Upcoming</Badge>;
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();

  const ParticipantsList = ({ participants }: { participants: Profile[] }) => {
    console.log("Participant details:", participants);

    if (!participants || participants.length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
          <p className="text-sm text-muted-foreground">
            This activity has no registered participants.
          </p>
        </div>
      );
    }

    return (
      <div className="max-h-[400px] overflow-y-auto pr-4 -mr-4">
        <div className="space-y-3">
          {participants.map((participant, index) => {
            console.log("Rendering participant:", participant);
            return (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {(participant.full_name || participant.email)
                        ?.charAt(0)
                        .toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {participant.full_name || "Unnamed User"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {participant.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    #{String(index + 1).padStart(2, "0")}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (activities.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                onClick={() => router.push("/admin/activities/new")}
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
            <Button onClick={() => router.push("/admin/activities/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Activity
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              onClick={() => router.push("/admin/activities/new")}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Activity
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
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
                        !isUpcoming(activity.date)
                          ? "text-muted-foreground"
                          : ""
                      }`}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {activity.title}
                            </span>
                            {getActivityStatus(activity.date)}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {activity.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(activity.date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {activity.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {getParticipantCount(activity)}/
                              {activity.max_participants || "∞"}
                            </span>
                          </div>
                          {getCapacityStatus(activity)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedActivity(activity)}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(
                                `/admin/activities/${activity.id}/edit`
                              )
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(activity.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <CustomCalendar activities={activities} isAdmin={true} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedActivity}
        onOpenChange={() => setSelectedActivity(null)}
      >
        <DialogContent className="bg-bg-light dark:bg-bg-dark border border-border">
          <DialogHeader>
            <DialogTitle>Activity Participants</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <ParticipantsList
              participants={selectedActivity.participant_details}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
