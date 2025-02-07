'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="hover:bg-rugby-teal/10 hover:text-rugby-teal border-rugby-teal/20"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer hover:bg-rugby-teal/10 hover:text-rugby-teal"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
        >
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-rugby-teal/10 hover:text-rugby-teal"
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
        >
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-rugby-teal/10 hover:text-rugby-teal"
          onClick={handleCopyLink}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 