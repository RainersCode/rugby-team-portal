"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React from "react";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  youtube_id: string;
  stream_date: string;
  status: "active" | "completed";
  thumbnail_url: string;
  viewers_count?: number;
}

interface Props {
  initialStreams: LiveStream[];
}

export default function AdminLiveClient({ initialStreams }: Props) {
  const [streams, setStreams] = useState<LiveStream[]>(initialStreams);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_id: "",
    stream_date: "",
    status: "active" as "active" | "completed",
    thumbnail_url: "",
  });

  // Initialize Supabase client once and store it
  const supabase = React.useMemo(() => createClientComponentClient(), []);

  const handleCreateStream = async () => {
    // Validate required fields
    if (!formData.title || !formData.youtube_id || !formData.stream_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: stream, error } = await supabase
        .from("live_streams")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            youtube_id: formData.youtube_id,
            stream_date: formData.stream_date,
            status: formData.status,
            thumbnail_url:
              formData.thumbnail_url ||
              `https://img.youtube.com/vi/${formData.youtube_id}/maxresdefault.jpg`,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setStreams([stream, ...streams]);
      setIsCreateOpen(false);
      resetForm();
      toast.success("Live stream created successfully");
    } catch (error) {
      console.error("Error creating stream:", error);
      toast.error("Failed to create live stream");
    }
  };

  const handleUpdateStream = async () => {
    if (!selectedStream) return;

    try {
      const { data: stream, error } = await supabase
        .from("live_streams")
        .update({
          title: formData.title,
          description: formData.description,
          youtube_id: formData.youtube_id,
          stream_date: formData.stream_date,
          status: formData.status,
          thumbnail_url:
            formData.thumbnail_url ||
            `https://img.youtube.com/vi/${formData.youtube_id}/maxresdefault.jpg`,
        })
        .eq("id", selectedStream.id)
        .select()
        .single();

      if (error) throw error;

      setStreams(streams.map((s) => (s.id === stream.id ? stream : s)));
      setIsEditOpen(false);
      resetForm();
      toast.success("Live stream updated successfully");
    } catch (error) {
      console.error("Error updating stream:", error);
      toast.error("Failed to update live stream");
    }
  };

  const handleDeleteStream = async (id: string) => {
    try {
      const { error } = await supabase
        .from("live_streams")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setStreams(streams.filter((stream) => stream.id !== id));
      toast.success("Live stream deleted successfully");
    } catch (error) {
      console.error("Error deleting stream:", error);
      toast.error("Failed to delete live stream");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      youtube_id: "",
      stream_date: "",
      status: "active",
      thumbnail_url: "",
    });
    setSelectedStream(null);
  };

  const handleEdit = (stream: LiveStream) => {
    setSelectedStream(stream);
    setFormData({
      title: stream.title,
      description: stream.description,
      youtube_id: stream.youtube_id,
      stream_date: format(new Date(stream.stream_date), "yyyy-MM-dd'T'HH:mm"),
      status: stream.status,
      thumbnail_url: stream.thumbnail_url,
    });
    setIsEditOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Live Stream
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Live Stream</DialogTitle>
              <DialogDescription>
                Add a new live stream to your channel
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateStream();
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_id">YouTube Video ID</Label>
                  <Input
                    id="youtube_id"
                    value={formData.youtube_id}
                    onChange={(e) =>
                      setFormData({ ...formData, youtube_id: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stream_date">Stream Date & Time</Label>
                  <Input
                    type="datetime-local"
                    id="stream_date"
                    value={formData.stream_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stream_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "completed",
                      })
                    }
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="thumbnail_url">
                    Thumbnail URL (Optional)
                  </Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thumbnail_url: e.target.value,
                      })
                    }
                    placeholder="Leave empty to use YouTube thumbnail"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Live Stream
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Live Stream</DialogTitle>
              <DialogDescription>Update live stream details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-youtube_id">YouTube Video ID</Label>
                <Input
                  id="edit-youtube_id"
                  value={formData.youtube_id}
                  onChange={(e) =>
                    setFormData({ ...formData, youtube_id: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-stream_date">Stream Date & Time</Label>
                <Input
                  type="datetime-local"
                  id="edit-stream_date"
                  value={formData.stream_date}
                  onChange={(e) =>
                    setFormData({ ...formData, stream_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "completed",
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-thumbnail_url">
                  Thumbnail URL (Optional)
                </Label>
                <Input
                  id="edit-thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail_url: e.target.value })
                  }
                  placeholder="Leave empty to use YouTube thumbnail"
                />
              </div>
              <Button onClick={handleUpdateStream} className="w-full">
                Update Live Stream
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="line-clamp-1">{stream.title}</CardTitle>
                  <CardDescription>
                    {format(new Date(stream.stream_date), "PPp")}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    stream.status === "active" ? "destructive" : "secondary"
                  }
                >
                  {stream.status === "active" ? "LIVE" : "RECORDED"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative mb-4 bg-muted rounded-lg overflow-hidden">
                <img
                  src={stream.thumbnail_url}
                  alt={stream.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {stream.description}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(stream)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Live Stream</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this live stream? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteStream(stream.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
