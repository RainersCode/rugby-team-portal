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
    document.body.style.overflow = 'hidden';
  };

  const handleDragEnd = (e: any, { offset, velocity }: { offset: { x: number }, velocity: { x: number } }) => {
    const swipe = offset.x;
    
    if (Math.abs(velocity.x) > 0.2 || Math.abs(swipe) > 100) {
      if (swipe < 0 && selectedGallery && selectedPhotoIndex < selectedGallery.photos.length - 1) {
        setSelectedPhotoIndex(prev => prev + 1);
      } else if (swipe > 0 && selectedGallery && selectedPhotoIndex > 0) {
        setSelectedPhotoIndex(prev => prev - 1);
      }
    }
  };

  const safeCloseGallery = () => {
    setSelectedPhotoIndex(0);
    
    document.body.style.overflow = 'auto';
    document.body.style.pointerEvents = 'auto';
    
    document.documentElement.style.pointerEvents = 'auto';
    
    setSelectedGallery(null);
    
    window.requestAnimationFrame(() => {
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
    });
  };

  // Global escape key and navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedGallery) return;
      
      if (e.key === 'Escape') {
        // Force reset any potential stuck UI state
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.pointerEvents = 'auto';
        
        // Close the gallery
        safeCloseGallery();
      } else if (e.key === 'ArrowRight' && selectedGallery && selectedPhotoIndex < selectedGallery.photos.length - 1) {
        setSelectedPhotoIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && selectedGallery && selectedPhotoIndex > 0) {
        setSelectedPhotoIndex(prev => prev - 1);
      }
    };
    
    // Add the global event handler
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGallery, selectedPhotoIndex]);
  
  // Document click handler to force reset any stuck UI state
  useEffect(() => {
    const handleDocumentClick = () => {
      // Only run this if no gallery is open
      if (!selectedGallery) {
        // Force reset any potential stuck UI state
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.pointerEvents = 'auto';
      }
    };
    
    // Add the document click handler
    document.addEventListener('click', handleDocumentClick);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [selectedGallery]);
  
  // Body overflow handler
  useEffect(() => {
    if (selectedGallery) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedGallery]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      // Force reset any potential stuck UI state
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
      
      // Reset state
      setSelectedGallery(null);
      setSelectedPhotoIndex(0);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
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
              <div key={i} className="h-full">
                <Card className="animate-pulse bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-muted rounded w-2/3"></div>
                      <div className="h-5 bg-muted rounded-full w-16"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 mt-4">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="aspect-square bg-muted rounded-md"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("/fnx banner png.png")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
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
              className="h-full"
            >
              <Card 
                className="group cursor-pointer overflow-hidden bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 hover:border-rugby-teal/50 dark:hover:border-rugby-teal/50 relative h-full flex flex-col rounded-none"
                onClick={() => handleGalleryClick(gallery)}
              >
                <div className="absolute inset-x-0 -top-px h-0.5 bg-gradient-to-r from-rugby-teal to-rugby-teal/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="group-hover:text-rugby-teal transition-colors text-lg md:text-xl font-medium">
                      {gallery.title}
                    </span>
                    <span className="text-xs md:text-sm font-medium text-white bg-rugby-teal/80 dark:bg-rugby-teal/90 px-2.5 py-1 rounded-none shadow-sm">
                      {t.photoCount(gallery.photos?.length || 0)}
                    </span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow flex flex-col">
                  <div className="aspect-video relative mb-4 overflow-hidden group-hover:shadow-lg transition-all rounded-none">
                    {gallery.photos?.[0] ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end justify-center pb-4">
                          <span className="px-4 py-2 bg-rugby-teal/80 text-white rounded-none text-sm font-medium transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                            {t.viewGallery}
                          </span>
                        </div>
                        <Image
                          src={gallery.photos[0].image_url}
                          alt={gallery.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                    {gallery.description}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-1.5">
                    {gallery.photos?.slice(1, 5).map((photo, photoIndex) => (
                      <div
                        key={photo.id}
                        className="aspect-square relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:z-10 ring-1 ring-gray-200/50 dark:ring-gray-700/50 rounded-none"
                      >
                        <Image
                          src={photo.image_url}
                          alt={photo.title || `Gallery image ${photoIndex + 2}`}
                          fill
                          sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 8vw"
                          className="object-cover"
                          loading="lazy"
                        />
                        {photoIndex === 3 && gallery.photos && gallery.photos.length > 5 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
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
            <div className="fixed inset-0 z-50">
              <div 
                className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => safeCloseGallery()}
              >
                <div className="absolute top-4 right-4 z-50">
                  <button
                    className="text-white hover:text-rugby-teal transition-colors p-2 rounded-none bg-black/30 hover:bg-black/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      safeCloseGallery();
                    }}
                    aria-label={t.closeGallery}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-rugby-teal transition-colors disabled:opacity-50 disabled:hover:text-white p-2 rounded-none bg-black/30 hover:bg-black/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPhotoIndex > 0) {
                      setSelectedPhotoIndex(prev => prev - 1);
                    }
                  }}
                  disabled={selectedPhotoIndex === 0}
                  aria-label={t.previousPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-rugby-teal transition-colors disabled:opacity-50 disabled:hover:text-white p-2 rounded-none bg-black/30 hover:bg-black/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPhotoIndex < selectedGallery.photos.length - 1) {
                      setSelectedPhotoIndex(prev => prev + 1);
                    }
                  }}
                  disabled={selectedPhotoIndex === selectedGallery.photos.length - 1}
                  aria-label={t.nextPhoto}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <div
                  className="relative w-full max-w-5xl h-[80vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute inset-0 overflow-hidden shadow-2xl rounded-none">
                    <Image
                      src={selectedGallery.photos[selectedPhotoIndex].image_url}
                      alt={selectedGallery.photos[selectedPhotoIndex].title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 75vw"
                      priority
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 rounded-none">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white text-xl md:text-2xl font-medium">
                          {selectedGallery.photos[selectedPhotoIndex].title}
                        </h3>
                        <span className="text-white/80 text-sm bg-black/30 px-3 py-1 rounded-none">
                          {t.photoOf(selectedPhotoIndex + 1, selectedGallery.photos.length)}
                        </span>
                      </div>
                      {selectedGallery.photos[selectedPhotoIndex].description && (
                        <p className="text-white/90 text-sm md:text-base">
                          {selectedGallery.photos[selectedPhotoIndex].description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-none"
                     onClick={(e) => e.stopPropagation()}>
                  {selectedGallery.photos.length > 10 ? (
                    <div className="flex items-center">
                      <span className="text-white/90 text-sm mr-2">
                        {selectedPhotoIndex + 1} / {selectedGallery.photos.length}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max={selectedGallery.photos.length - 1}
                        value={selectedPhotoIndex}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newIndex = parseInt(e.target.value);
                          if (!isNaN(newIndex) && newIndex >= 0 && newIndex < selectedGallery.photos.length) {
                            setSelectedPhotoIndex(newIndex);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-32 md:w-48 h-2 bg-gray-700 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-rugby-teal"
                      />
                    </div>
                  ) : (
                    selectedGallery.photos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-none transition-all ${
                          index === selectedPhotoIndex
                            ? "bg-rugby-teal w-4"
                            : "bg-white/50 hover:bg-rugby-teal/80"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex(index);
                        }}
                        aria-label={`Go to photo ${index + 1}`}
                      />
                    ))
                  )}
                </div>
                
                <div className="absolute top-4 left-4 z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-none">
                    <h2 className="text-white text-sm md:text-base font-normal">
                      {selectedGallery.title}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 