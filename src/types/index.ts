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

export type ExerciseCategory = 
  | 'weightlifting'
  | 'sprint'
  | 'cardio'
  | 'strength'
  | 'agility'
  | 'flexibility'
  | 'recovery';

export type DifficultyLevel = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'elite';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  difficulty: DifficultyLevel;
  equipment: string[];
  muscles_targeted: string[];
  video_url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  duration_weeks: number;
  target_audience: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author?: {
    email: string;
  };
}

export interface ProgramWorkout {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  week_number: number;
  day_number: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps?: number;
  duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
  order_index: number;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_participants: number;
  created_at: string;
  updated_at: string;
  participants: { count: number }[];
  participant_details: {
    id: string;
    email: string;
    full_name: string | null;
  }[];
} 