export interface ArticleBlock {
  type: 'paragraph' | 'heading' | 'image';
  content: string;
  level?: 1 | 2 | 3; // For headings
  imageUrl?: string; // For images
  imageAlt?: string; // For images
  styles?: {
    italic?: boolean;
    // Add more styles as needed
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  blocks: ArticleBlock[];
  image: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  user: {
    email: string;
  } | null;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  image: string;
  nationality: string;
  height: string;
  weight: string;
  age: number;
  stats: {
    matches: number;
    tries: number;
    assists: number;
    tackles: number;
  };
}

export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  score?: {
    home: number;
    away: number;
  };
  status: 'upcoming' | 'live' | 'completed';
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
  inStock: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
} 