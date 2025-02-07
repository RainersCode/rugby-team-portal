"use client";

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MapPin, Users, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ActivityCalendarProps {
  activities: Activity[];
}

export default function ActivityCalendar({ activities }: ActivityCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Convert activities to calendar events
  const events = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    start: new Date(activity.date),
    end: new Date(new Date(activity.date).setHours(new Date(activity.date).getHours() + 2)),
    allDay: false,
    resource: activity,
  }));

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
  }, []);

  // Format the event time for display
  const formatEventTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  // Custom event component
  const EventComponent = ({ event }: any) => (
    <div className="flex items-center gap-2 p-1.5 overflow-hidden">
      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span className="font-medium text-xs truncate">{event.title}</span>
    </div>
  );

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('PREV')}
            className="hover:bg-accent h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('NEXT')}
            className="hover:bg-accent h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-base font-medium">{label}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          className="h-8 text-xs font-medium"
        >
          Today
        </Button>
      </div>
      <div className="flex items-center rounded-lg border p-0.5 gap-0.5">
        <Button
          variant={view === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onView('month')}
          className="h-7 text-xs font-medium"
        >
          Month
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onView('week')}
          className="h-7 text-xs font-medium"
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onView('day')}
          className="h-7 text-xs font-medium"
        >
          Day
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none">
        <div className="h-[700px] [&_.rbc-calendar]:font-sans [&_.rbc-toolbar]:mb-0 [&_.rbc-toolbar_button]:cursor-pointer [&_.rbc-month-view]:border-none [&_.rbc-month-view]:rounded-lg [&_.rbc-month-view]:bg-background [&_.rbc-month-header]:bg-muted/50 [&_.rbc-header]:font-medium [&_.rbc-header]:text-xs [&_.rbc-header]:py-2.5 [&_.rbc-header]:border-none [&_.rbc-month-row]:border-border/40 [&_.rbc-day-bg]:transition-colors [&_.rbc-today]:bg-accent/5 [&_.rbc-off-range-bg]:bg-muted/5 [&_.rbc-event]:border-none [&_.rbc-event]:shadow-none [&_.rbc-event]:transition-all [&_.rbc-event]:duration-200 [&_.rbc-event.rbc-selected]:shadow-lg [&_.rbc-event.rbc-selected]:scale-[1.02] [&_.rbc-event-content]:font-medium [&_.rbc-event-content]:text-xs [&_.rbc-time-view]:border-none [&_.rbc-time-view]:rounded-lg [&_.rbc-time-view]:bg-background [&_.rbc-time-header]:border-border/40 [&_.rbc-time-content]:border-border/40 [&_.rbc-time-gutter]:text-xs [&_.rbc-time-gutter]:font-medium [&_.rbc-current-time-indicator]:bg-primary/90 [&_.rbc-day-slot_.rbc-time-slot]:border-border/20 [&_.rbc-day-bg:hover]:bg-accent/5 [&_.rbc-show-more]:text-primary [&_.rbc-show-more]:font-medium [&_.rbc-show-more]:text-xs [&_.rbc-show-more:hover]:text-primary/80 [&_.rbc-show-more:hover]:no-underline [&_.rbc-date-cell]:text-xs [&_.rbc-date-cell]:p-1 [&_.rbc-date-cell>a]:text-muted-foreground [&_.rbc-date-cell>a:hover]:text-foreground [&_.rbc-date-cell>a:hover]:no-underline [&_.rbc-now-indicator]:bg-primary/90 [&_.rbc-overlay]:bg-background [&_.rbc-overlay]:border [&_.rbc-overlay]:border-border [&_.rbc-overlay]:rounded-lg [&_.rbc-overlay]:shadow-lg [&_.rbc-overlay]:p-2 [&_.rbc-overlay-header]:text-xs [&_.rbc-overlay-header]:font-medium [&_.rbc-overlay-header]:border-b [&_.rbc-overlay-header]:border-border [&_.rbc-overlay-header]:pb-2 [&_.rbc-overlay-header]:mb-2 [&_.rbc-agenda-view]:bg-background [&_.rbc-agenda-view]:rounded-lg [&_.rbc-agenda-view]:border-none [&_.rbc-agenda-table]:border-border/40 [&_.rbc-agenda-date-cell]:text-xs [&_.rbc-agenda-time-cell]:text-xs [&_.rbc-agenda-event-cell]:text-xs">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            date={date}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
            }}
            eventPropGetter={(event) => {
              const isUpcoming = new Date(event.start) > new Date();
              return {
                className: cn(
                  'text-white rounded-md border-none cursor-pointer transition-colors',
                  isUpcoming 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                ),
              };
            }}
            dayPropGetter={(date) => ({
              className: 'font-medium',
            })}
            tooltipAccessor={null}
            popup
          />
        </div>
      </Card>

      {selectedEvent && (
        <Card className="relative border shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-8 w-8 hover:bg-accent"
            onClick={() => setSelectedEvent(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">{selectedEvent.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedEvent.resource.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Date & Time</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedEvent.start)} at {formatEventTime(selectedEvent.start)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10">
                    <MapPin className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Location</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedEvent.resource.location}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Participants</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedEvent.resource.participant_count}
                      {selectedEvent.resource.max_participants 
                        ? ` of ${selectedEvent.resource.max_participants} spots filled`
                        : ' participants'}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={selectedEvent.resource.participant_count >= (selectedEvent.resource.max_participants || Infinity) ? "destructive" : "success"}
                  className="text-xs"
                >
                  {selectedEvent.resource.participant_count >= (selectedEvent.resource.max_participants || Infinity) ? "Full" : "Available"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 