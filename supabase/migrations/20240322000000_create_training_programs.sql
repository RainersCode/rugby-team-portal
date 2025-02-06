-- Create enum for exercise categories
CREATE TYPE public.exercise_category AS ENUM (
  'weightlifting',
  'sprint',
  'cardio',
  'strength',
  'agility',
  'flexibility',
  'recovery'
);

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'elite'
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category exercise_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  equipment TEXT[], -- Array of required equipment
  muscles_targeted TEXT[], -- Array of muscles targeted
  video_url TEXT, -- Optional video demonstration
  image_url TEXT, -- Optional exercise image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create training programs table
CREATE TABLE public.training_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty difficulty_level NOT NULL,
  duration_weeks INTEGER NOT NULL,
  target_audience TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create program workouts table (for organizing exercises into workouts within a program)
CREATE TABLE public.program_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workout exercises table (junction table between workouts and exercises)
CREATE TABLE public.workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES public.program_workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER, -- NULL for time-based exercises
  duration_seconds INTEGER, -- NULL for rep-based exercises
  rest_seconds INTEGER NOT NULL,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for exercises
CREATE POLICY "Exercises are viewable by everyone"
  ON public.exercises FOR SELECT
  USING (true);

CREATE POLICY "Exercises are insertable by authenticated users with admin role"
  ON public.exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Exercises are updatable by authenticated users with admin role"
  ON public.exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Exercises are deletable by authenticated users with admin role"
  ON public.exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Policies for training programs
CREATE POLICY "Training programs are viewable by everyone"
  ON public.training_programs FOR SELECT
  USING (true);

CREATE POLICY "Training programs are insertable by authenticated users with admin role"
  ON public.training_programs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Training programs are updatable by authenticated users with admin role"
  ON public.training_programs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Training programs are deletable by authenticated users with admin role"
  ON public.training_programs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Policies for program workouts
CREATE POLICY "Program workouts are viewable by everyone"
  ON public.program_workouts FOR SELECT
  USING (true);

CREATE POLICY "Program workouts are insertable by authenticated users with admin role"
  ON public.program_workouts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Program workouts are updatable by authenticated users with admin role"
  ON public.program_workouts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Program workouts are deletable by authenticated users with admin role"
  ON public.program_workouts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Policies for workout exercises
CREATE POLICY "Workout exercises are viewable by everyone"
  ON public.workout_exercises FOR SELECT
  USING (true);

CREATE POLICY "Workout exercises are insertable by authenticated users with admin role"
  ON public.workout_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Workout exercises are updatable by authenticated users with admin role"
  ON public.workout_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Workout exercises are deletable by authenticated users with admin role"
  ON public.workout_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create functions to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.program_workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 