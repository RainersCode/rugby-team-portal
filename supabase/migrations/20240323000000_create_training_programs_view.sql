-- Create view for training programs with authors
CREATE VIEW public.training_programs_with_authors AS
SELECT 
  tp.*,
  p.email as author_email
FROM public.training_programs tp
LEFT JOIN public.profiles p ON tp.author_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.training_programs_with_authors TO authenticated;
GRANT SELECT ON public.training_programs_with_authors TO anon; 