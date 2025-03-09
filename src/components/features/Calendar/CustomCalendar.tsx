import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, Match } from "@/types";
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
import { lv, enUS } from "date-fns/locale";
import { useLanguage } from "@/context/LanguageContext";
import "./calendar-styles.css";

// Calendar translations
const calendarTranslations = {
  en: {
    // Month names already handled by date-fns locales
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    legend: {
      activities: "Activities",
      matches: "Matches",
      daysWithMatches: "Days with matches"
    },
    status: {
      upcoming: "Upcoming",
      completed: "Completed",
      live: "LIVE",
      today: "Today",
      past: "Past",
      started: "Started"
    },
    details: {
      viewDetails: "View Details",
      viewMatchDetails: "View Match Details",
      startsIn: "Starts in:",
      participants: "participants",
      max: "max"
    }
  },
  lv: {
    // Month names already handled by date-fns locales
    days: ["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "Se"],
    legend: {
      activities: "Aktivitātes",
      matches: "Spēles",
      daysWithMatches: "Dienas ar spēlēm"
    },
    status: {
      upcoming: "Gaidāmais",
      completed: "Pabeigts",
      live: "TIEŠRAIDE",
      today: "Šodien",
      past: "Pagātne",
      started: "Sācies"
    },
    details: {
      viewDetails: "Skatīt Detaļas",
      viewMatchDetails: "Skatīt Spēles Detaļas",
      startsIn: "Sākas pēc:",
      participants: "dalībnieki",
      max: "maks."
    }
  }
};

interface CustomCalendarProps {
  activities: Activity[];
  matches?: Match[];
  isAdmin?: boolean;
}

export default function CustomCalendar({
  activities,
  matches = [],
  isAdmin = false,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { language } = useLanguage();
  const translations = calendarTranslations[language];
  const dateLocale = language === 'lv' ? lv : enUS;

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
      const daysInPrevMonth = getDaysInMonth(
        new Date(date.getFullYear(), date.getMonth() - 1)
      );
      for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
        prevMonthDays.push({
          day: i,
          date: formatDate(
            prevMonth.getFullYear(),
            prevMonth.getMonth(),
            i
          ),
        });
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
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      for (let i = 1; i <= 6 - lastDay; i++) {
        nextMonthDays.push({
          day: i,
          date: formatDate(nextMonth.getFullYear(), nextMonth.getMonth(), i),
        });
      }
    }
    return nextMonthDays;
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  const getActivitiesForDate = (date: string) => {
    return activities.filter(
      (activity) => activity.date.substring(0, 10) === date
    );
  };

  const getMatchesForDate = (date: string) => {
    return matches.filter(
      (match) => 
        match.match_date.substring(0, 10) === date || 
        match.date?.substring(0, 10) === date
    );
  };

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
    const dayMatches = getMatchesForDate(date);
    const isCurrentDate = isToday(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dayNumber
    );
    
    // Determine if the day has matches and should have a special border
    const hasMatches = dayMatches.length > 0;

    return (
      <div
        className={cn(
          "min-h-[120px] p-2 border relative group transition-colors",
          isCurrentMonth ? "bg-card" : "bg-muted/50",
          isCurrentDate && "ring-2 ring-rugby-teal ring-inset",
          hasMatches 
            ? "border-rugby-yellow border-2" 
            : "border-border",
          !isCurrentMonth && hasMatches && "opacity-70"
        )}
      >
        <span
          className={cn(
            "text-sm font-medium flex items-center",
            !isCurrentMonth && "text-muted-foreground",
            isCurrentDate && "text-rugby-teal"
          )}
        >
          {dayNumber}
          {hasMatches && (
            <span className="ml-1 inline-block w-2 h-2 bg-rugby-yellow rounded-full"></span>
          )}
        </span>
        <div className="space-y-1 mt-1">
          {dayActivities.map((activity) => (
            <div
              key={`activity-${activity.id}`}
              onClick={() => setSelectedActivity(activity)}
              className="text-xs p-1 rounded-none border-l-2 border-rugby-teal bg-rugby-teal/15 hover:bg-rugby-teal/25 cursor-pointer truncate text-gray-800 dark:text-white flex items-center font-medium"
            >
              <Calendar className="w-3 h-3 mr-1 flex-shrink-0 text-rugby-teal" />
              <span className="truncate">{activity.title}</span>
            </div>
          ))}
          
          {dayMatches.map((match) => (
            <div
              key={`match-${match.id}`}
              onClick={() => setSelectedMatch(match)}
              className="text-xs p-1 rounded-none border-l-2 border-rugby-yellow bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 cursor-pointer truncate text-gray-800 dark:text-white flex items-center font-medium"
            >
              <Trophy className="w-3 h-3 mr-1 flex-shrink-0 text-green-700 dark:text-green-400" />
              <span className="truncate">{match.home_team} vs {match.away_team}</span>
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
      return <Badge variant="secondary">{translations.status.past}</Badge>;
    }
    if (activityDate.toDateString() === now.toDateString()) {
      return <Badge variant="default">{translations.status.today}</Badge>;
    }
    return <Badge className="bg-rugby-teal text-white">{translations.status.upcoming}</Badge>;
  };

  const getMatchStatus = (status: string, date: string) => {
    if (status === 'live') {
      return <Badge className="bg-rugby-yellow text-black animate-pulse">{translations.status.live}</Badge>;
    }
    if (status === 'completed') {
      return <Badge variant="secondary">{translations.status.completed}</Badge>;
    }
    
    const matchDate = new Date(date);
    const now = new Date();
    
    if (matchDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-rugby-yellow text-gray-900 dark:text-gray-900">{translations.status.today}</Badge>;
    }
    
    return <Badge className="bg-green-600 text-white font-medium">{translations.status.upcoming}</Badge>;
  };

  return (
    <>
      <div className="bg-card rounded-none border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
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

        <div className="grid grid-cols-7 gap-[1px] bg-border">
          {/* Day Headers */}
          {translations.days.map((day) => (
            <div
              key={day}
              className="p-2 bg-muted/70 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}

          {/* Previous Month Days */}
          {getPreviousMonthDays(currentDate).map(({ day, date }) => (
            <div key={`prev-${day}`}>{renderDay(day, false, date)}</div>
          ))}

          {/* Current Month Days */}
          {Array.from({
            length: getDaysInMonth(currentDate),
          }).map((_, index) => {
            const day = index + 1;
            const date = formatDate(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            return <div key={`current-${day}`}>{renderDay(day, true, date)}</div>;
          })}

          {/* Next Month Days */}
          {getNextMonthDays(currentDate).map(({ day, date }) => (
            <div key={`next-${day}`}>{renderDay(day, false, date)}</div>
          ))}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-l-2 border-rugby-teal bg-rugby-teal/15 rounded-none"></div>
            <span className="text-xs text-muted-foreground">{translations.legend.activities}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-l-2 border-rugby-yellow bg-green-50 dark:bg-green-900/30 rounded-none"></div>
            <span className="text-xs text-muted-foreground">{translations.legend.matches}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-rugby-yellow bg-card rounded-none"></div>
            <span className="text-xs text-muted-foreground">{translations.legend.daysWithMatches}</span>
          </div>
        </div>
      </div>

      {/* Activity Details Dialog */}
      <Dialog
        open={selectedActivity !== null}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
        className="rounded-none"
      >
        {selectedActivity && (
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-2 border-rugby-teal/30 rounded-none [&>*]:rounded-none [&>button]:rounded-none">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between mr-8">
                <DialogTitle className="font-normal text-base">
                  {selectedActivity.title}
                </DialogTitle>
                {getActivityStatus(selectedActivity.date)}
              </div>
              <DialogDescription>
                {format(new Date(selectedActivity.date), "PPP", { locale: dateLocale })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedActivity.description}
              </p>
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {selectedActivity.time || format(new Date(selectedActivity.date), "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedActivity.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {selectedActivity.participant_count || 0} {translations.details.participants}
                    {selectedActivity.max_participants
                      ? ` / ${selectedActivity.max_participants} ${translations.details.max}`
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  asChild
                  className="bg-rugby-teal hover:bg-rugby-teal/90 text-white rounded-none"
                >
                  <Link href={`/activities#${selectedActivity.id}`}>
                    {translations.details.viewDetails}
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Match Details Dialog */}
      <Dialog
        open={selectedMatch !== null}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
        className="rounded-none"
      >
        {selectedMatch && (
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-2 border-green-600/30 rounded-none [&>*]:rounded-none [&>button]:rounded-none">
            <DialogHeader className="pb-4">
              <div className="flex items-center justify-between mr-8">
                <DialogTitle className="font-normal text-base">
                  {selectedMatch.home_team} vs {selectedMatch.away_team}
                </DialogTitle>
                {getMatchStatus(selectedMatch.status, selectedMatch.match_date || selectedMatch.date)}
              </div>
              <DialogDescription>
                {format(new Date(selectedMatch.match_date || selectedMatch.date), "PPP", { locale: dateLocale })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMatch.status === 'completed' && (
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {selectedMatch.score_home} - {selectedMatch.score_away}
                  </p>
                </div>
              )}
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-green-700 dark:text-green-400" />
                  <span>{selectedMatch.competition || 'Rugby Match'}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedMatch.match_date || selectedMatch.date), "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{selectedMatch.venue || 'TBA'}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                >
                  <Link href={`/matches/${selectedMatch.id}`}>
                    {translations.details.viewMatchDetails}
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
