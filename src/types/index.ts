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

export interface MatchEvent {
  type: 'try' | 'conversion' | 'penalty' | 'drop_goal';
  team: 'home' | 'away';
  player: string;
  minute: number;
  points: number;
}

export interface PlayerCard {
  type: 'yellow' | 'red';
  team: 'home' | 'away';
  player: string;
  minute: number;
  reason: string;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_image: string;
  away_team_image: string;
  match_date: string;
  venue: string;
  competition: string;
  home_score?: number;
  away_score?: number;
  status: 'upcoming' | 'live' | 'completed';
  description?: string;
  match_events?: MatchEvent[];
  player_cards?: PlayerCard[];
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