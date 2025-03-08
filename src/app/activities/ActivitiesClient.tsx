"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity as BaseActivity } from "@/types";
import CustomCalendar from "@/components/features/Calendar/CustomCalendar";
import { useLanguage } from "@/context/LanguageContext";

interface ActivityWithParticipation extends BaseActivity {
  participant_count: number;
  is_participating: boolean;
}

interface Props {
  activities: ActivityWithParticipation[];
  userId?: string;
  isAdmin?: boolean;
}

const activityTranslations = {
  en: {
    title: "Team Activities",
    noActivities: {
      title: "No Upcoming Activities",
      description: "Check back later for new activities or contact the team for more information."
    },
    participation: {
      youreIn: "You're In!",
      full: "Full",
      spotsAvailable: "Spots Available",
      joinActivity: "Join Activity",
      cancelParticipation: "Cancel Participation",
      activityFull: "Activity Full"
    },
    views: {
      cardView: "Card View",
      calendarView: "Calendar View"
    }
  },
  lv: {
    title: "Komandas Aktivitātes",
    noActivities: {
      title: "Nav Gaidāmo Aktivitāšu",
      description: "Pārbaudiet vēlāk jaunas aktivitātes vai sazinieties ar komandu, lai iegūtu vairāk informācijas."
    },
    participation: {
      youreIn: "Tu Piedalies!",
      full: "Pilns",
      spotsAvailable: "Ir Brīvas Vietas",
      joinActivity: "Pievienoties",
      cancelParticipation: "Atcelt Dalību",
      activityFull: "Aktivitāte Pilna"
    },
    views: {
      cardView: "Kartes Skats",
      calendarView: "Kalendāra Skats"
    }
  }
};

export default function ActivitiesClient({
  activities: initialActivities,
  userId,
  isAdmin = false,
}: Props) {
  const [activities, setActivities] = useState(initialActivities);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { language } = useLanguage();

  const handleParticipation = async (
    activityId: string,
    isParticipating: boolean
  ) => {
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    try {
      if (isParticipating) {
        const { error } = await supabase
          .from("activity_participants")
          .delete()
          .eq("activity_id", activityId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("activity_participants")
          .insert([{ activity_id: activityId, user_id: userId }]);

        if (error) throw error;
      }

      setActivities(
        activities.map((activity) => {
          if (activity.id === activityId) {
            return {
              ...activity,
              is_participating: !isParticipating,
              participant_count: isParticipating
                ? activity.participant_count - 1
                : activity.participant_count + 1,
            };
          }
          return activity;
        })
      );

      router.refresh();
    } catch (error) {
      console.error("Error updating participation:", error);
    }
  };

  const isActivityFull = (activity: ActivityWithParticipation) => {
    return (
      activity.max_participants !== null &&
      activity.participant_count >= activity.max_participants
    );
  };

  const getParticipationStatus = (activity: ActivityWithParticipation) => {
    if (activity.is_participating) {
      return {
        badge: (
          <Badge className="bg-rugby-teal/10 text-rugby-teal hover:bg-rugby-teal/20 transition-colors">
            {activityTranslations[language].participation.youreIn}
          </Badge>
        ),
        button: {
          variant: "destructive" as const,
          text: activityTranslations[language].participation.cancelParticipation,
        },
      };
    }
    if (isActivityFull(activity)) {
      return {
        badge: <Badge variant="destructive">{activityTranslations[language].participation.full}</Badge>,
        button: {
          variant: "outline" as const,
          text: activityTranslations[language].participation.activityFull,
          disabled: true,
        },
      };
    }
    return {
      badge: (
        <Badge className="bg-rugby-yellow/10 text-rugby-yellow hover:bg-rugby-yellow/20 transition-colors">
          {activityTranslations[language].participation.spotsAvailable}
        </Badge>
      ),
      button: {
        variant: "default" as const,
        text: activityTranslations[language].participation.joinActivity,
      },
    };
  };

  if (activities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative container-width text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {activityTranslations[language].title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="container-width py-12">
          <Card className="text-center p-8 border-rugby-teal/20">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-rugby-teal" />
              <h3 className="text-lg font-semibold mb-2">
                {activityTranslations[language].noActivities.title}
              </h3>
              <p className="text-muted-foreground">
                {activityTranslations[language].noActivities.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {activityTranslations[language].title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container-width py-12">
        <Tabs defaultValue="grid" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-2 w-[400px] border-2 border-rugby-teal/30">
              <TabsTrigger
                value="grid"
                className="flex items-center gap-2 data-[state=active]:bg-rugby-teal data-[state=active]:text-white data-[state=active]:border-b-0"
              >
                <Users className="w-4 h-4" />
                {activityTranslations[language].views.cardView}
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2 data-[state=active]:bg-rugby-teal data-[state=active]:text-white data-[state=active]:border-b-0"
              >
                <Calendar className="w-4 h-4" />
                {activityTranslations[language].views.calendarView}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => {
                const status = getParticipationStatus(activity);
                const activityDate = new Date(activity.date);
                const isUpcoming = activityDate > new Date();

                return (
                  <Card
                    key={activity.id}
                    className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-rugby-teal/20
                      ${
                        isUpcoming
                          ? "bg-white dark:bg-gray-900"
                          : "bg-gray-50/50 dark:bg-gray-900/50"
                      }
                    `}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-rugby-red" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />

                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        {status.badge}
                        <span className="text-sm text-muted-foreground">
                          {activity.participant_count}{" "}
                          {activity.max_participants
                            ? `/ ${activity.max_participants}`
                            : ""}{" "}
                          participants
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-2 font-medium text-foreground group-hover:text-black dark:group-hover:text-black transition-colors">
                        {activity.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {activity.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-rugby-yellow" />
                          <time
                            dateTime={activity.date}
                            className="text-muted-foreground"
                          >
                            {formatDate(activity.date)}
                          </time>
                        </div>

                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-rugby-red" />
                          <span className="text-muted-foreground">
                            {activity.location}
                          </span>
                        </div>

                        <div className="pt-4">
                          <Button
                            className={`w-full group relative ${
                              status.button.variant === "default"
                                ? "bg-rugby-teal hover:bg-rugby-teal/90 text-white font-medium"
                                : status.button.variant === "destructive"
                                ? "bg-rugby-red hover:bg-rugby-red/90 text-white font-medium"
                                : "bg-gray-100 text-gray-500"
                            }`}
                            variant={status.button.variant}
                            disabled={status.button.disabled}
                            onClick={() =>
                              handleParticipation(
                                activity.id,
                                activity.is_participating
                              )
                            }
                          >
                            {status.button.text}
                            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CustomCalendar activities={activities} isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
