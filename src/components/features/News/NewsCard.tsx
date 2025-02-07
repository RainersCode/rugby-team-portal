"use client";

import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  article: Article;
  priority?: boolean;
}

export default function NewsCard({ article, priority = false }: NewsCardProps) {
  return (
    <article className="group relative bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] border border-rugby-teal/20 hover:border-rugby-teal">
      <Link href={`/news/${article.slug}`}>
        <div className="relative h-48">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority={priority}
          />
        </div>
        <div className="p-6">
          <div className="flex justify-end mb-2">
            <time className="text-sm text-content-medium dark:text-content-medium">
              {formatDistanceToNow(new Date(article.created_at), {
                addSuffix: true,
              })}
            </time>
          </div>
          <h3 className="text-xl font-bold mb-2 text-content-light dark:text-content-dark line-clamp-2 group-hover:text-rugby-teal transition-colors">
            {article.title}
          </h3>
          <p className="text-content-medium dark:text-content-medium line-clamp-3">
            {article.content.substring(0, 150)}...
          </p>
        </div>
      </Link>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rugby-teal to-rugby-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </article>
  );
}
