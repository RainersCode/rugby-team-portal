"use client";

import { useState } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface GalleryPhoto {
  id: string;
  gallery_id: string;
  image_url: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface Props {
  galleryId: string;
  initialPhotos: GalleryPhoto[];
}

export default function GalleryPhotosClient({ galleryId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files) return;

      const uploadPromises = Array.from(files).map(async (file) => {
        // Upload image to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gallery-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        // Create database record
        const { data: photo, error: dbError } = await supabase
          .from('gallery_photos')
          .insert([
            {
              gallery_id: galleryId,
              image_url: publicUrl,
              title: file.name.split('.')[0], // Use filename as initial title
            },
          ])
          .select()
          .single();

        if (dbError) throw dbError;

        return photo;
      });

      const newPhotos = await Promise.all(uploadPromises);
      setPhotos([...newPhotos, ...photos]);
      
      toast.success(`Successfully uploaded ${files.length} photo${files.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      // Delete from storage
      const fileName = photo.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('photos')
          .remove([`gallery-photos/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      setPhotos(photos.filter((p) => p.id !== photo.id));
      
      toast.success("Photo deleted successfully");
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error("Failed to delete photo");
    }
  };

  const handleUpdatePhotoDetails = async (
    photo: GalleryPhoto,
    updates: Partial<GalleryPhoto>
  ) => {
    try {
      const { data: updatedPhoto, error } = await supabase
        .from('gallery_photos')
        .update(updates)
        .eq('id', photo.id)
        .select()
        .single();

      if (error) throw error;

      setPhotos(
        photos.map((p) => (p.id === photo.id ? updatedPhoto : p))
      );
      
      toast.success("Photo details updated successfully");
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error("Failed to update photo details");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/gallery">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Galleries
          </Button>
        </Link>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUploadPhotos}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button disabled={uploading}>
            <Plus className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-card rounded-lg overflow-hidden shadow-md"
          >
            <div className="relative aspect-square">
              <Image
                src={photo.image_url}
                alt={photo.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleDeletePhoto(photo)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <Input
                value={photo.title}
                onChange={(e) =>
                  handleUpdatePhotoDetails(photo, { title: e.target.value })
                }
                className="mb-2"
                placeholder="Photo title"
              />
              <Input
                value={photo.description || ""}
                onChange={(e) =>
                  handleUpdatePhotoDetails(photo, { description: e.target.value })
                }
                placeholder="Photo description (optional)"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 