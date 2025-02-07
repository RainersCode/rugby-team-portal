'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Play } from "lucide-react";
import { format } from "date-fns";

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
    <div className="space-y-8">
      {/* Main Stream Display */}
      <div className="bg-card rounded-xl overflow-hidden shadow-xl">
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
                  <h2 className="text-2xl font-bold mb-2">{selectedStream.title}</h2>
                  <p className="text-muted-foreground">{selectedStream.description}</p>
                </div>
                <Badge variant={selectedStream.status === 'active' ? 'destructive' : 'secondary'}>
                  {selectedStream.status === 'active' ? 'LIVE' : 'RECORDED'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(selectedStream.stream_date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(selectedStream.stream_date), 'HH:mm')}
                </div>
                {selectedStream.viewers_count && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {selectedStream.viewers_count} viewers
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active live stream</p>
              <p className="text-sm">Check back later for our next broadcast</p>
            </div>
          </div>
        )}
      </div>

      {/* Past Broadcasts */}
      {pastStreams.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Past Broadcasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastStreams.map((stream) => (
              <Card 
                key={stream.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedStream(stream)}
              >
                <div className="aspect-video relative">
                  <img
                    src={stream.thumbnail_url}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{stream.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(stream.stream_date), 'MMM d')}
                    </div>
                    {stream.viewers_count && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {stream.viewers_count}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 