"use client";

import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  article: Article;
  priority?: boolean;
  variant?: 'default' | 'compact';
}

export default function NewsCard({ 
  article, 
  priority = false, 
  variant = 'default' 
}: NewsCardProps) {
  const isCompact = variant === 'compact';
  
  return (
    <article className={cn(
      "group relative bg-card-bg-light dark:bg-card-bg-dark rounded-none shadow-lg overflow-hidden transition-transform hover:scale-[1.02] border-2 border-rugby-teal/30 hover:border-rugby-teal hover:shadow-xl",
      isCompact && "hover:scale-[1.01]"
    )}>
      <Link href={`/news/${article.slug}`}>
        <div className={cn(
          "relative",
          isCompact ? "h-32" : "h-48"
        )}>
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
        <div className={cn(
          "p-6",
          isCompact && "p-4"
        )}>
          <div className="flex justify-end mb-2">
            <time className={cn(
              "text-content-medium dark:text-content-medium",
              isCompact ? "text-xs" : "text-sm"
            )}>
              {formatDistanceToNow(new Date(article.created_at), {
                addSuffix: true,
              })}
            </time>
          </div>
          <h3 className={cn(
            "font-bold mb-2 text-content-light dark:text-content-dark line-clamp-2 group-hover:text-rugby-teal transition-colors",
            isCompact ? "text-base" : "text-xl"
          )}>
            {article.title}
          </h3>
          {!isCompact && (
            <p className="text-content-medium dark:text-content-medium line-clamp-3">
              {article.content.substring(0, 150)}...
            </p>
          )}
        </div>
      </Link>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </article>
  );
}
