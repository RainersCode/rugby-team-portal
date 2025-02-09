'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Play } from "lucide-react";
import { format } from "date-fns";
import LiveChat from '@/components/LiveChat';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  stream_date: string;
  status: 'active' | 'completed';
  thumbnail_url: string;
  viewers_count?: number;
}

interface LivePageClientProps {
  activeStream: LiveStream | null;
  pastStreams: LiveStream[];
}

export default function LivePageClient({ activeStream, pastStreams }: LivePageClientProps) {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(activeStream);

  return (
    <div className="space-y-12">
      {/* Main Stream Display */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {selectedStream ? 'Current Broadcast' : 'Live Stream'}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl overflow-hidden shadow-xl border border-rugby-teal/20 group hover:shadow-2xl transition-all duration-300">
              {selectedStream ? (
                <>
                  {/* YouTube Embed */}
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedStream.youtube_id}${selectedStream.status === 'active' ? '?autoplay=1' : ''}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  {/* Stream Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-rugby-teal transition-colors">{selectedStream.title}</h3>
                        <p className="text-muted-foreground">{selectedStream.description}</p>
                      </div>
                      <Badge className={selectedStream.status === 'active' 
                        ? 'bg-rugby-red/10 text-rugby-red hover:bg-rugby-red/20' 
                        : 'bg-rugby-teal/10 text-rugby-teal hover:bg-rugby-teal/20'}>
                        {selectedStream.status === 'active' ? 'LIVE' : 'RECORDED'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rugby-teal" />
                        {format(new Date(selectedStream.stream_date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-rugby-yellow" />
                        {format(new Date(selectedStream.stream_date), 'HH:mm')}
                      </div>
                      {selectedStream.viewers_count && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-rugby-red" />
                          {selectedStream.viewers_count} viewers
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No active stream at the moment.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Panel */}
          <div className="lg:col-span-1 h-[600px]">
            <LiveChat />
          </div>
        </div>
      </section>

      {/* Past Broadcasts */}
      {pastStreams.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Past Broadcasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastStreams.map((stream) => (
              <Card 
                key={stream.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-rugby-teal/20"
                onClick={() => setSelectedStream(stream)}
              >
                <div className="aspect-video relative">
                  <img
                    src={stream.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-rugby-yellow" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1 group-hover:text-rugby-teal transition-colors">{stream.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-rugby-teal" />
                      {format(new Date(stream.stream_date), 'MMM d')}
                    </div>
                    {stream.viewers_count && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-rugby-red" />
                        {stream.viewers_count}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 