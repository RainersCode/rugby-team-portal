"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type: string;
  thumbnail_url?: string;
  likes_count?: number;
  comments_count?: number;
}

// Mock data for development
const mockPosts: InstagramPost[] = [
  {
    id: "1",
    media_url: "https://picsum.photos/seed/rugby1/800/800",
    permalink: "#",
    caption:
      "Amazing match day! Our team showed incredible spirit and determination. 🏉 #RugbyLife #TeamSpirit",
    media_type: "IMAGE",
    likes_count: 234,
    comments_count: 18,
  },
  {
    id: "2",
    media_url: "https://picsum.photos/seed/rugby2/800/800",
    permalink: "#",
    caption:
      "Training session in full swing. Building strength and skills for the upcoming season! 💪 #RugbyTraining",
    media_type: "IMAGE",
    likes_count: 187,
    comments_count: 12,
  },
  {
    id: "3",
    media_url: "https://picsum.photos/seed/rugby3/800/800",
    permalink: "#",
    caption:
      "Celebrating our victory with the fans! Thank you for your amazing support! 🏆 #Champions",
    media_type: "IMAGE",
    likes_count: 543,
    comments_count: 42,
  },
  {
    id: "4",
    media_url: "https://picsum.photos/seed/rugby4/800/800",
    permalink: "#",
    caption:
      "New season, new kit! What do you think of our new look? 👕 #RugbyStyle",
    media_type: "IMAGE",
    likes_count: 321,
    comments_count: 28,
  },
  {
    id: "5",
    media_url: "https://picsum.photos/seed/rugby5/800/800",
    permalink: "#",
    caption:
      "Team building day! Building bonds that go beyond the field. 🤝 #TeamBuilding",
    media_type: "IMAGE",
    likes_count: 276,
    comments_count: 15,
  },
  {
    id: "6",
    media_url: "https://picsum.photos/seed/rugby6/800/800",
    permalink: "#",
    caption:
      "Perfect weather for rugby! Getting ready for today's match. ☀️ #MatchDay",
    media_type: "IMAGE",
    likes_count: 198,
    comments_count: 21,
  },
  {
    id: "7",
    media_url: "https://picsum.photos/seed/rugby7/800/800",
    permalink: "#",
    caption:
      "Youth academy in action! Nurturing the next generation of rugby stars. 🌟 #YouthRugby",
    media_type: "IMAGE",
    likes_count: 167,
    comments_count: 14,
  },
  {
    id: "8",
    media_url: "https://picsum.photos/seed/rugby8/800/800",
    permalink: "#",
    caption:
      "Community outreach day! Giving back to our amazing supporters. ❤️ #RugbyCommunity",
    media_type: "IMAGE",
    likes_count: 289,
    comments_count: 23,
  },
];

interface InstagramFeedProps {
  accessToken: string;
  limit?: number;
}

export default function InstagramFeed({
  accessToken,
  limit = 8,
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        // If we're in development or don't have an access token, use mock data
        if (!accessToken || process.env.NODE_ENV === "development") {
          setTimeout(() => {
            setPosts(mockPosts.slice(0, limit));
            setLoading(false);
          }, 1000); // Simulate loading
          return;
        }

        const response = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${accessToken}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Instagram posts");
        }

        const data = await response.json();
        setPosts(data.data);
      } catch (err) {
        console.error("Error fetching Instagram posts:", err);
        setError("Failed to load Instagram feed");
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, [accessToken, limit]);

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          <Image
            src={
              post.media_type === "VIDEO"
                ? post.thumbnail_url || post.media_url
                : post.media_url
            }
            alt={post.caption || "Instagram post"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
              {post.caption && (
                <p className="text-sm text-center line-clamp-3 mb-4">
                  {post.caption}
                </p>
              )}
              <div className="flex items-center gap-4">
                {post.likes_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    <span>{post.likes_count}</span>
                  </div>
                )}
                {post.comments_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
