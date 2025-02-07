import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Galerija | Regbija klubs",
  description: "Regbija kluba galerija ar bildēm no spēlēm un pasākumiem",
};

export default function GalleryPage() {
  return (
    <div className="container-width py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Gallery</h1>
        <p className="text-muted-foreground mt-1">Browse our photo collections</p>
      </div>
      <GalleryClient />
    </div>
  );
}
