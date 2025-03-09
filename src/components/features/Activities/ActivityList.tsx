import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Activity } from "@/types";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";

interface ActivityListProps {
  activities: Activity[];
  title: string;
  viewAllLink?: string;
  maxDisplay?: number;
}

export default function ActivityList({ 
  activities, 
  title, 
  viewAllLink = "/activities",
  maxDisplay = 3
}: ActivityListProps) {
  const { language } = useLanguage();

  // Sort activities by date (most recent first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Limit the number of activities to display
  const displayActivities = sortedActivities.slice(0, maxDisplay);

  // Check if the activity is today or in the future
  const isUpcoming = (date: string) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container-width py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-l-4 border-rugby-teal pl-3 py-1">
            {title}
          </h2>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Calendar View Button */}
            <Link
              href="/activities?view=calendar"
              className="group flex items-center gap-2 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
            >
              <Calendar className="w-5 h-5" />
              <span>{language === "en" ? "Calendar" : "Kalendārs"}</span>
            </Link>
            
            {/* View All Button */}
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="group flex items-center gap-1 text-rugby-teal hover:text-rugby-teal/80 font-medium transition-colors bg-white dark:bg-gray-800 px-4 py-2 border-2 border-rugby-teal/30 hover:border-rugby-teal shadow-lg hover:shadow-xl rounded-none"
              >
                <ChevronRight className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {displayActivities.length === 0 ? (
          <Card className="text-center p-8 border-rugby-teal/20">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-rugby-teal" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en" ? "No Upcoming Activities" : "Nav Gaidāmo Aktivitāšu"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Check back later for upcoming team activities and events" 
                  : "Apskatiet vēlāk, lai uzzinātu par gaidāmajām komandas aktivitātēm un pasākumiem"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayActivities.map((activity) => {
              const activityDate = new Date(activity.date);
              const upcoming = isUpcoming(activity.date);

              return (
                <Card
                  key={activity.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 border-rugby-teal/20 bg-white dark:bg-gray-900"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-rugby-teal" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      {upcoming ? (
                        <Badge className="bg-rugby-teal text-white mb-2">
                          {language === "en" ? "Upcoming" : "Gaidāmais"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mb-2">
                          {language === "en" ? "Past" : "Pagātne"}
                        </Badge>
                      )}
                      <CardTitle className="text-xl font-medium mb-4 line-clamp-1">
                        {activity.title}
                      </CardTitle>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {activity.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2 text-rugby-teal" />
                          <span>{formatDate(activity.date, language)}</span>
                        </div>
                        {activity.time && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2 text-rugby-teal" />
                            <span>{activity.time}</span>
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2 text-rugby-teal" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Countdown Timer for upcoming activities */}
                    {upcoming && (
                      <CountdownTimer 
                        targetDate={activity.date} 
                        targetTime={activity.time} 
                      />
                    )}
                    
                    <div className="pt-4">
                      <Link href={`/activities#${activity.id}`}>
                        <Button
                          className="w-full group relative bg-rugby-teal hover:bg-rugby-teal/90 text-white font-medium"
                        >
                          {language === "en" ? "View Details" : "Skatīt Detaļas"}
                          <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow via-rugby-red to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
} 