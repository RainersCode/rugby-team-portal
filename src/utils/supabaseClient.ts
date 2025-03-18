import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a Supabase client for use in browser components
export const supabase = createClientComponentClient(); 