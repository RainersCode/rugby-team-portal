"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Gallery {
  id: string;
  title: string;
  description: string;
  created_at: string;
  photos: GalleryPhoto[];
}

interface GalleryPhoto {
  id: string;
  image_url: string;
  title: string;
  description: string | null;
}

export default function GalleryClient() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const { data: galleries, error } = await supabase
        .from("galleries")
        .select(`
          *,
          photos:gallery_photos(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGalleries(galleries || []);
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryClick = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setSelectedPhotoIndex(0);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedGallery && selectedPhotoIndex < selectedGallery.photos.length - 1) {
      setSelectedPhotoIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedGallery && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg"></div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {galleries.map((gallery, index) => (
          <motion.div
            key={gallery.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-rugby-teal/20 hover:border-rugby-teal"
              onClick={() => handleGalleryClick(gallery)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="group-hover:text-rugby-teal transition-colors">
                    {gallery.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {gallery.photos?.length || 0} photos
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative mb-4 bg-muted rounded-lg overflow-hidden group-hover:shadow-lg transition-all">
                  {gallery.photos?.[0] ? (
                    <Image
                      src={gallery.photos[0].image_url}
                      alt={gallery.photos[0].title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {gallery.description}
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {gallery.photos?.slice(1, 5).map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square relative rounded-md overflow-hidden"
                    >
                      <Image
                        src={photo.image_url}
                        alt={photo.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedGallery(null)}
          >
            <div className="absolute top-4 right-4 z-50">
              <button
                className="text-white hover:text-rugby-teal transition-colors"
                onClick={() => setSelectedGallery(null)}
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-rugby-teal transition-colors disabled:opacity-50 disabled:hover:text-white"
              onClick={handlePrevPhoto}
              disabled={selectedPhotoIndex === 0}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-rugby-teal transition-colors disabled:opacity-50 disabled:hover:text-white"
              onClick={handleNextPhoto}
              disabled={selectedPhotoIndex === selectedGallery.photos.length - 1}
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <motion.div
              key={selectedGallery.photos[selectedPhotoIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedGallery.photos[selectedPhotoIndex].image_url}
                alt={selectedGallery.photos[selectedPhotoIndex].title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {selectedGallery.photos[selectedPhotoIndex].title}
                </h3>
                {selectedGallery.photos[selectedPhotoIndex].description && (
                  <p className="text-white/80">
                    {selectedGallery.photos[selectedPhotoIndex].description}
                  </p>
                )}
              </div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {selectedGallery.photos.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedPhotoIndex
                      ? "bg-rugby-teal w-4"
                      : "bg-white/50 hover:bg-rugby-teal/80"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(index);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 