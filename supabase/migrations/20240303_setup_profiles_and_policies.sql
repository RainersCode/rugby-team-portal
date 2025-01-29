-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own non-role fields" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  address TEXT,
  birth_date TEXT,
  bio TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Backup existing profiles if they exist
CREATE TABLE IF NOT EXISTS profiles_backup AS 
SELECT * FROM public.profiles;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace trigger for creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for all users
CREATE POLICY "Everyone can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR public.is_admin()
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own non-role fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR public.is_admin()
);

-- Create admin-only policies
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.is_admin());

-- Set first user as admin (run this after creating first user)
CREATE OR REPLACE FUNCTION public.set_first_user_as_admin()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = (
    SELECT id
    FROM auth.users
    ORDER BY created_at
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
