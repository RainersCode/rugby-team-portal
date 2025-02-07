"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
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

interface Gallery {
  id: string;
  title: string;
  description: string;
  created_at: string;
  photos: { count: number }[];
}

interface Props {
  initialGalleries: Gallery[];
}

export default function AdminGalleryClient({ initialGalleries }: Props) {
  const [galleries, setGalleries] = useState<Gallery[]>(initialGalleries);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGallery, setNewGallery] = useState({ title: "", description: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient();

  const handleCreateGallery = async () => {
    try {
      const { data: gallery, error } = await supabase
        .from("galleries")
        .insert([
          {
            title: newGallery.title,
            description: newGallery.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGalleries([{ ...gallery, photos: [{ count: 0 }] }, ...galleries]);
      setIsCreateOpen(false);
      setNewGallery({ title: "", description: "" });
      
      toast.success("Gallery created successfully");
    } catch (error) {
      console.error("Error creating gallery:", error);
      toast.error("Failed to create gallery");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      setIsDeleting(true);

      // First, get all photos in the gallery
      const { data: photos, error: photosError } = await supabase
        .from('gallery_photos')
        .select('image_url')
        .eq('gallery_id', id);

      if (photosError) throw photosError;

      // Delete photos from storage
      if (photos && photos.length > 0) {
        const fileNames = photos.map(photo => {
          const url = new URL(photo.image_url);
          return url.pathname.split('/').pop() || '';
        });

        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove(fileNames.map(name => `gallery-photos/${name}`));

        if (storageError) {
          console.error('Error deleting photos from storage:', storageError);
        }
      }

      // Delete the gallery (this will cascade delete the photos from the database)
      const { error: deleteError } = await supabase
        .from("galleries")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setGalleries(galleries.filter((gallery) => gallery.id !== id));
      toast.success("Gallery deleted successfully");
    } catch (error) {
      console.error("Error deleting gallery:", error);
      toast.error("Failed to delete gallery");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Gallery
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bg-light dark:bg-bg-dark border border-border">
            <DialogHeader>
              <DialogTitle>Create New Gallery</DialogTitle>
              <DialogDescription>
                Create a new gallery to organize your photos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newGallery.title}
                  onChange={(e) =>
                    setNewGallery({ ...newGallery, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGallery.description}
                  onChange={(e) =>
                    setNewGallery({ ...newGallery, description: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleCreateGallery} className="w-full">
                Create Gallery
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <Card key={gallery.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{gallery.title}</CardTitle>
                  <CardDescription>
                    {new Date(gallery.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-bg-light dark:bg-bg-dark border border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this gallery? This action will permanently delete the gallery and all its photos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteGallery(gallery.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {gallery.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span>{gallery.photos[0]?.count || 0} photos</span>
              </div>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.location.href = `/admin/gallery/${gallery.id}/photos`}
                >
                  Manage Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 