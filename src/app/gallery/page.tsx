import { Metadata } from "next";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "Galerija | Regbija klubs",
  description: "Regbija kluba galerija ar bildēm no spēlēm un pasākumiem",
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}
