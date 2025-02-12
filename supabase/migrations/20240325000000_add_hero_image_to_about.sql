-- Add hero_image column to about_page table
ALTER TABLE about_page
ADD COLUMN hero_image TEXT;

-- Update existing row with default hero image
UPDATE about_page
SET hero_image = 'images/about-hero.jpg'
WHERE hero_image IS NULL; 