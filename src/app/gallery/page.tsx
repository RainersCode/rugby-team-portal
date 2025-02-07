import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Galerija | Regbija klubs",
  description: "Regbija kluba galerija ar bildēm no spēlēm un pasākumiem",
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-light to-gray-50 dark:from-bg-dark dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative py-20 bg-primary-blue overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 left-1/4 top-1/4">
            <div className="w-96 h-96 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="relative container-width text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Photo Gallery
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore our collection of memorable moments from matches, training sessions, and team events.
          </p>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container-width py-12">
        <GalleryClient />
      </div>
    </div>
  );
}
