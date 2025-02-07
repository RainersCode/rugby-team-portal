"use client";

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format as dateFnsFormat } from 'date-fns';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MapPin, Users, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format: dateFnsFormat,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ActivityCalendarProps {
  activities: Activity[];
  isAdmin?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Activity;
}

interface ToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: View) => void;
}

interface EventComponentProps {
  event: CalendarEvent;
}

export default function ActivityCalendar({ activities, isAdmin = false }: ActivityCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    maxParticipants: '',
    time: '12:00',
  });

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

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    if (!isAdmin) return;
    setSelectedDate(start);
    setIsCreateDialogOpen(true);
  }, [isAdmin]);

  const handleCreateActivity = async () => {
    if (!selectedDate) return;

    try {
      setIsCreating(true);
      // Combine date and time
      const [hours, minutes] = formData.time.split(':').map(Number);
      const activityDate = new Date(selectedDate);
      activityDate.setHours(hours, minutes);

      const { data: activity, error } = await supabase
        .from('activities')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: activityDate.toISOString(),
            location: formData.location,
            max_participants: parseInt(formData.maxParticipants) || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        location: '',
        maxParticipants: '',
        time: '12:00',
      });
      setIsCreateDialogOpen(false);
      setSelectedDate(null);
      router.refresh();
    } catch (error) {
      console.error('Error creating activity:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!isAdmin) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this activity?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSelectedEvent(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // Format the event time for display
  const formatEventTime = (date: Date) => {
    return dateFnsFormat(date, 'h:mm a');
  };

  // Custom event component
  const EventComponent = ({ event }: EventComponentProps) => (
    <div className="flex items-center gap-2 p-1.5 overflow-hidden">
      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span className="font-medium text-xs truncate">{event.title}</span>
    </div>
  );

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }: ToolbarProps) => (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 ">
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
      <Card className="border border-border bg-bg-light dark:bg-bg-dark p-4 rounded-lg">
        <div className="h-[700px] [&_.rbc-calendar]:font-sans [&_.rbc-toolbar]:mb-0 [&_.rbc-toolbar_button]:cursor-pointer 
          [&_.rbc-month-view]:border-none [&_.rbc-month-view]:rounded-lg [&_.rbc-month-view]:bg-transparent
          [&_.rbc-month-header]:bg-accent/5 [&_.rbc-month-header]:dark:bg-accent/10 
          [&_.rbc-header]:font-medium [&_.rbc-header]:text-xs [&_.rbc-header]:py-3 [&_.rbc-header]:border-none 
          [&_.rbc-month-row]:border-border/40 [&_.rbc-month-row]:dark:border-border/20 
          [&_.rbc-day-bg]:transition-colors [&_.rbc-day-bg]:duration-200
          [&_.rbc-today]:bg-blue-50/50 [&_.rbc-today]:dark:bg-blue-950/20 
          [&_.rbc-today:hover]:bg-blue-100/70 [&_.rbc-today:hover]:dark:bg-blue-900/30
          [&_.rbc-off-range-bg]:bg-muted/5 [&_.rbc-off-range-bg]:dark:bg-muted/10 
          [&_.rbc-off-range-bg:hover]:bg-muted/10 [&_.rbc-off-range-bg:hover]:dark:bg-muted/20
          [&_.rbc-day-bg:hover]:bg-accent/10 [&_.rbc-day-bg:hover]:dark:bg-accent/20
          [&_.rbc-day]:hover:bg-accent/10 [&_.rbc-day]:dark:hover:bg-accent/20
          [&_.rbc-date-cell]:hover:bg-accent/10 [&_.rbc-date-cell]:dark:hover:bg-accent/20
          [&_.rbc-event]:border-none [&_.rbc-event]:shadow-sm [&_.rbc-event]:transition-all [&_.rbc-event]:duration-200 
          [&_.rbc-event.rbc-selected]:shadow-lg [&_.rbc-event.rbc-selected]:scale-[1.02] 
          [&_.rbc-event-content]:font-medium [&_.rbc-event-content]:text-xs 
          [&_.rbc-time-view]:border-none [&_.rbc-time-view]:rounded-lg [&_.rbc-time-view]:bg-transparent
          [&_.rbc-time-header]:border-border/40 [&_.rbc-time-header]:dark:border-border/20 
          [&_.rbc-time-content]:border-border/40 [&_.rbc-time-content]:dark:border-border/20 
          [&_.rbc-time-gutter]:text-xs [&_.rbc-time-gutter]:font-medium 
          [&_.rbc-current-time-indicator]:bg-blue-500/90 
          [&_.rbc-day-slot_.rbc-time-slot]:border-border/20 [&_.rbc-day-slot_.rbc-time-slot]:dark:border-border/10 
          [&_.rbc-show-more]:text-blue-600 [&_.rbc-show-more]:dark:text-blue-400 [&_.rbc-show-more]:font-medium [&_.rbc-show-more]:text-xs 
          [&_.rbc-show-more:hover]:text-blue-700 [&_.rbc-show-more:hover]:dark:text-blue-300 [&_.rbc-show-more:hover]:no-underline 
          [&_.rbc-date-cell]:text-xs [&_.rbc-date-cell]:p-1 [&_.rbc-date-cell]:relative [&_.rbc-date-cell]:z-10 [&_.rbc-date-cell]:transition-colors [&_.rbc-date-cell]:duration-200
          [&_.rbc-date-cell>a]:text-muted-foreground [&_.rbc-date-cell>a:hover]:text-foreground [&_.rbc-date-cell>a:hover]:no-underline 
          [&_.rbc-now-indicator]:bg-blue-500/90 
          [&_.rbc-overlay]:bg-bg-light [&_.rbc-overlay]:dark:bg-bg-dark [&_.rbc-overlay]:border [&_.rbc-overlay]:border-border 
          [&_.rbc-overlay]:rounded-lg [&_.rbc-overlay]:shadow-lg [&_.rbc-overlay]:p-2 
          [&_.rbc-overlay-header]:text-xs [&_.rbc-overlay-header]:font-medium [&_.rbc-overlay-header]:border-b 
          [&_.rbc-overlay-header]:border-border [&_.rbc-overlay-header]:pb-2 [&_.rbc-overlay-header]:mb-2 
          [&_.rbc-agenda-view]:bg-transparent [&_.rbc-agenda-view]:rounded-lg [&_.rbc-agenda-view]:border-none 
          [&_.rbc-agenda-table]:border-border/40 [&_.rbc-agenda-table]:dark:border-border/20 
          [&_.rbc-agenda-date-cell]:text-xs [&_.rbc-agenda-time-cell]:text-xs [&_.rbc-agenda-event-cell]:text-xs">
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
            onSelectSlot={handleSelectSlot}
            selectable={isAdmin}
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
                  'text-white rounded-md border-none cursor-pointer transition-colors shadow-sm',
                  isUpcoming 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-500 dark:hover:to-gray-600'
                ),
              };
            }}
            dayPropGetter={(date) => ({
              className: cn(
                'font-medium transition-colors duration-200',
                isAdmin && 'cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/20'
              ),
            })}
            tooltipAccessor={null}
            popup
          />
        </div>
      </Card>

      {/* Create Activity Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-bg-light dark:bg-bg-dark border border-gray-200 dark:border-gray-800">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <DialogTitle>Create New Activity</DialogTitle>
            <DialogDescription>
              Add a new activity for {selectedDate ? dateFnsFormat(selectedDate, 'MMMM d, yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Activity title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Activity description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Activity location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                placeholder="Leave empty for no limit"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateActivity}
              disabled={!formData.title || !formData.location || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Activity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[425px] bg-bg-light dark:bg-bg-dark border border-gray-200 dark:border-gray-800">
            <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
              <DialogTitle className="text-lg font-semibold">{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                {selectedEvent.resource.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  variant={selectedEvent.resource.participant_count >= (selectedEvent.resource.max_participants || Infinity) ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {selectedEvent.resource.participant_count >= (selectedEvent.resource.max_participants || Infinity) ? "Full" : "Available"}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/admin/activities/${selectedEvent.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteActivity(selectedEvent.id)}
                  >
                    Delete Activity
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 