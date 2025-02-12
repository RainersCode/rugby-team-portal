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
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  name: string;
  position?: string;
  number?: number;
  image_url?: string;
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
  date: string;
  venue?: string;
  competition?: string;
  score_home?: number;
  score_away?: number;
  status: 'upcoming' | 'completed' | 'live';
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
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image_url?: string;
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

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at: string;
} 