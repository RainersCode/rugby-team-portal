import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity } from "@/types";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CustomCalendarProps {
  activities: Activity[];
  isAdmin?: boolean;
}

export default function CustomCalendar({
  activities,
  isAdmin = false,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonthDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonthDays = [];
    if (firstDay > 0) {
      const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
      const daysInPrevMonth = getDaysInMonth(prevMonth);
      for (let i = firstDay - 1; i >= 0; i--) {
        prevMonthDays.push(daysInPrevMonth - i);
      }
    }
    return prevMonthDays;
  };

  const getNextMonthDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      daysInMonth
    ).getDay();
    const nextMonthDays = [];
    if (lastDay < 6) {
      for (let i = 1; i <= 6 - lastDay; i++) {
        nextMonthDays.push(i);
      }
    }
    return nextMonthDays;
  };

  const formatDate = (year: number, month: number, day: number) => {
    return new Date(year, month, day).toISOString().split("T")[0];
  };

  const getActivitiesForDate = (date: string) => {
    return activities.filter((activity) => activity.date.startsWith(date));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const renderDay = (
    dayNumber: number,
    isCurrentMonth: boolean = true,
    date: string
  ) => {
    const dayActivities = getActivitiesForDate(date);
    const isCurrentDate = isToday(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dayNumber
    );

    return (
      <div
        className={cn(
          "min-h-[120px] p-2 border border-border relative group transition-colors",
          isCurrentMonth ? "bg-card" : "bg-muted/50",
          isCurrentDate && "ring-2 ring-rugby-teal ring-inset"
        )}
      >
        <span
          className={cn(
            "text-sm font-medium",
            !isCurrentMonth && "text-muted-foreground",
            isCurrentDate && "text-rugby-teal"
          )}
        >
          {dayNumber}
        </span>
        <div className="space-y-1 mt-1">
          {dayActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => setSelectedActivity(activity)}
              className="text-xs p-1 rounded bg-rugby-teal/10 hover:bg-rugby-teal/20 cursor-pointer truncate text-rugby-teal"
            >
              {activity.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getActivityStatus = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();

    if (activityDate < now) {
      return <Badge variant="secondary">Past</Badge>;
    }
    if (activityDate.toDateString() === now.toDateString()) {
      return <Badge variant="default">Today</Badge>;
    }
    return <Badge className="bg-rugby-teal text-white">Upcoming</Badge>;
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Day names */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Previous month days */}
          {getPreviousMonthDays(currentDate).map((day) => (
            <div key={`prev-${day}`}>
              {renderDay(
                day,
                false,
                formatDate(
                  currentDate.getMonth() === 0
                    ? currentDate.getFullYear() - 1
                    : currentDate.getFullYear(),
                  currentDate.getMonth() === 0
                    ? 11
                    : currentDate.getMonth() - 1,
                  day
                )
              )}
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: getDaysInMonth(currentDate) }).map(
            (_, index) => (
              <div key={`current-${index + 1}`}>
                {renderDay(
                  index + 1,
                  true,
                  formatDate(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    index + 1
                  )
                )}
              </div>
            )
          )}

          {/* Next month days */}
          {getNextMonthDays(currentDate).map((day) => (
            <div key={`next-${day}`}>
              {renderDay(
                day,
                false,
                formatDate(
                  currentDate.getMonth() === 11
                    ? currentDate.getFullYear() + 1
                    : currentDate.getFullYear(),
                  currentDate.getMonth() === 11
                    ? 0
                    : currentDate.getMonth() + 1,
                  day
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Details Dialog */}
      <Dialog
        open={!!selectedActivity}
        onOpenChange={() => setSelectedActivity(null)}
      >
        <DialogContent className="sm:max-w-[500px] bg-bg-light dark:bg-bg-dark border border-border">
          {selectedActivity && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-xl">
                    {selectedActivity.title}
                  </DialogTitle>
                  {getActivityStatus(selectedActivity.date)}
                </div>
                <DialogDescription className="mt-2 text-muted-foreground">
                  {selectedActivity.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-rugby-teal" />
                  <span className="text-foreground">
                    {format(
                      new Date(selectedActivity.date),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-rugby-yellow" />
                  <span className="text-foreground">
                    {format(new Date(selectedActivity.date), "h:mm a")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-rugby-red" />
                  <span className="text-foreground">
                    {selectedActivity.location}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-rugby-teal" />
                  <span className="text-foreground">
                    {selectedActivity.participant_count || 0}
                    {selectedActivity.max_participants
                      ? ` / ${selectedActivity.max_participants}`
                      : ""}{" "}
                    participants
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedActivity(null)}
                >
                  Close
                </Button>
                {isAdmin ? (
                  <Button
                    className="bg-rugby-teal hover:bg-rugby-teal/90 text-white"
                    onClick={() => {
                      window.location.href = `/admin/activities/${selectedActivity.id}/edit`;
                    }}
                  >
                    Edit Activity
                  </Button>
                ) : (
                  <Button
                    className="bg-rugby-teal hover:bg-rugby-teal/90 text-white"
                    onClick={() => {
                      // Handle join/leave logic here
                      setSelectedActivity(null);
                    }}
                  >
                    Join Activity
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
