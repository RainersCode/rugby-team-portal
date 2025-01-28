export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  publishedAt: string;
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