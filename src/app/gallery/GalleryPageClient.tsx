"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const galleryTranslations = {
  en: {
    title: "Gallery",
    loading: "Loading galleries...",
    photoCount: (count: number) => `${count} photos`,
    viewGallery: "View Gallery",
    closeGallery: "Close Gallery",
    previousPhoto: "Previous Photo",
    nextPhoto: "Next Photo",
    photoOf: (current: number, total: number) => `Photo ${current} of ${total}`,
  },
  lv: {
    title: "Galerija",
    loading: "Ielādē galerijas...",
    photoCount: (count: number) => `${count} foto`,
    viewGallery: "Skatīt galeriju",
    closeGallery: "Aizvērt galeriju",
    previousPhoto: "Iepriekšējā fotogrāfija",
    nextPhoto: "Nākamā fotogrāfija",
    photoOf: (current: number, total: number) => `Fotogrāfija ${current} no ${total}`,
  }
};

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

export default function GalleryPageClient() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { language } = useLanguage();
  const t = galleryTranslations[language];

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
      <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative py-20 bg-rugby-teal overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {/* Main large rugby ball */}
            <div className="absolute transform -rotate-45 left-1/4 top-1/4">
              <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Smaller rugby ball top right */}
            <div className="absolute transform rotate-12 right-1/4 top-8">
              <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Small rugby ball bottom left */}
            <div className="absolute transform -rotate-20 left-16 bottom-8">
              <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Extra small ball top left */}
            <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
              <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Medium ball bottom right */}
            <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
              <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Small ball center right */}
            <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
              <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
            {/* Tiny ball top center */}
            <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
              <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
            </div>
          </div>
          <div className="relative container-width text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.title}
            </h1>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container-width py-12">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-rugby-teal overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Main large rugby ball */}
          <div className="absolute transform -rotate-45 left-1/4 top-1/4">
            <div className="w-[90px] h-[40px] md:w-[120px] md:h-[50px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Smaller rugby ball top right */}
          <div className="absolute transform rotate-12 right-1/4 top-8">
            <div className="w-[70px] h-[30px] md:w-[90px] md:h-[35px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small rugby ball bottom left */}
          <div className="absolute transform -rotate-20 left-16 bottom-8">
            <div className="w-[50px] h-[22px] md:w-[60px] md:h-[25px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Extra small ball top left */}
          <div className="absolute transform rotate-45 hidden md:block left-16 top-12">
            <div className="w-[40px] h-[18px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Medium ball bottom right */}
          <div className="absolute transform -rotate-12 hidden md:block right-20 bottom-16">
            <div className="w-[100px] h-[40px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Small ball center right */}
          <div className="absolute transform rotate-30 hidden lg:block right-1/3 top-1/3">
            <div className="w-[70px] h-[28px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
          {/* Tiny ball top center */}
          <div className="absolute transform -rotate-15 hidden lg:block left-1/2 top-8">
            <div className="w-[45px] h-[20px] rounded-[50%] bg-rugby-yellow"></div>
          </div>
        </div>
        <div className="relative container-width mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.title}
          </h1>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container-width py-12">
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
                className="group cursor-pointer overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-rugby-teal/20 hover:border-rugby-teal relative"
                onClick={() => handleGalleryClick(gallery)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="group-hover:text-rugby-teal transition-colors">
                      {gallery.title}
                    </span>
                    <span className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {t.photoCount(gallery.photos?.length || 0)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video relative mb-4 rounded-lg overflow-hidden group-hover:shadow-lg transition-all">
                    {gallery.photos?.[0] ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                        <Image
                          src={gallery.photos[0].image_url}
                          alt={gallery.photos[0].title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {gallery.description}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {gallery.photos?.slice(1, 5).map((photo, index) => (
                      <div
                        key={photo.id}
                        className="aspect-square relative rounded-md overflow-hidden transform transition-transform duration-300 hover:scale-105"
                      >
                        <Image
                          src={photo.image_url}
                          alt={photo.title}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && gallery.photos && gallery.photos.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">+{gallery.photos.length - 5}</span>
                          </div>
                        )}
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
                  aria-label={t.closeGallery}
                >
                  <X className="h-8 w-8" />
                </button>
              </div>

              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-rugby-teal transition-colors disabled:opacity-50 disabled:hover:text-white"
                onClick={handlePrevPhoto}
                disabled={selectedPhotoIndex === 0}
                aria-label={t.previousPhoto}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-rugby-teal transition-colors disabled:opacity-50 disabled:hover:text-white"
                onClick={handleNextPhoto}
                disabled={selectedPhotoIndex === selectedGallery.photos.length - 1}
                aria-label={t.nextPhoto}
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
      </div>
    </div>
  );
} 