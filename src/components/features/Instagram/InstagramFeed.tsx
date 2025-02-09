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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
        {Array.from({ length: limit }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
      {posts.map((post, index) => {
        // Define different layouts for each card
        const layouts = {
          0: "md:col-span-2 md:row-span-2", // Large square featured card
          1: "md:col-span-1 md:row-span-2", // Tall vertical card
          2: "md:col-span-1 md:row-span-1", // Small square card
          3: "md:col-span-1 md:row-span-1", // Small square card
          4: "md:col-span-2 md:row-span-1", // Wide horizontal card
          5: "md:col-span-1 md:row-span-2", // Tall vertical card
          6: "md:col-span-2 md:row-span-1", // Wide horizontal card
          7: "md:col-span-1 md:row-span-1", // Small square card
        };

        // Define text size based on card size
        const getTextSize = (index: number) => {
          const largeCards = [0]; // Large featured cards
          const mediumCards = [1, 4, 5, 6]; // Tall or wide cards
          
          if (largeCards.includes(index)) return 'text-xl';
          if (mediumCards.includes(index)) return 'text-base';
          return 'text-sm';
        };

        return (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md border border-rugby-teal/20 hover:border-rugby-teal transition-all duration-300 ${
              layouts[index as keyof typeof layouts]
            }`}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 text-white">
                {post.caption && (
                  <p className={`font-medium mb-3 line-clamp-3 ${getTextSize(index)}`}>
                    {post.caption}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  {post.likes_count !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rugby-yellow" />
                      <span>{post.likes_count}</span>
                    </div>
                  )}
                  {post.comments_count !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-rugby-yellow" />
                      <span>{post.comments_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-yellow to-rugby-teal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </a>
        );
      })}
    </div>
  );
}
