'use client';

import { Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  title: string;
  size?: 'default' | 'lg';
}

export default function ShareButtons({ title, size = 'default' }: ShareButtonsProps) {
  const isLarge = size === 'lg';
  const encodedTitle = encodeURIComponent(title);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${currentUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${currentUrl}&title=${encodedTitle}`,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {shareLinks.map((platform) => {
        const Icon = platform.icon;
        return (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex items-center justify-center transition-all duration-300",
              isLarge ? "p-3" : "p-2",
              "hover:bg-rugby-teal/10 rounded-full"
            )}
            title={`Share on ${platform.name}`}
          >
            <Icon 
              className={cn(
                "text-rugby-teal transition-colors duration-300 group-hover:text-rugby-teal/80",
                isLarge ? "w-6 h-6" : "w-4 h-4"
              )} 
            />
          </a>
        );
      })}
    </div>
  );
} 