-- Drop existing objects if they exist
DROP TABLE IF EXISTS about_page CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Create the timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- Create the about page table
CREATE TABLE about_page (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    history TEXT NOT NULL,
    mission TEXT NOT NULL,
    values TEXT NOT NULL,
    team_highlights JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create the trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON about_page
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE about_page ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to about page"
    ON about_page
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow admin update access to about page"
    ON about_page
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    ));

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy for authenticated users
CREATE POLICY "Allow authenticated users to upload images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'public' 
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow public access to view images
CREATE POLICY "Allow public to view images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'public');

-- Insert initial data
INSERT INTO about_page (history, mission, values, team_highlights)
VALUES (
    'Our rugby team was founded with the passion for the sport and community spirit. Starting from humble beginnings, we have grown into a tight-knit family of players and supporters.',
    'To promote rugby excellence, foster community engagement, and develop players both on and off the field.',
    'Teamwork, Respect, Integrity, Passion, and Excellence',
    '[
        {"title": "Community Engagement", "description": "Regular involvement in local sports initiatives"},
        {"title": "Player Development", "description": "Comprehensive training programs for all skill levels"},
        {"title": "Team Spirit", "description": "Strong focus on camaraderie and mutual support"}
    ]'::jsonb
); 