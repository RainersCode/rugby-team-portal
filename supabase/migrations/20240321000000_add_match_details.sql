-- Add match details columns
ALTER TABLE public.matches
ADD COLUMN description TEXT,
ADD COLUMN match_events JSONB DEFAULT '[]'::jsonb,
ADD COLUMN player_cards JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.matches.description IS 'General match description and summary';
COMMENT ON COLUMN public.matches.match_events IS 'Array of match events (tries, penalties, conversions, etc)';
COMMENT ON COLUMN public.matches.player_cards IS 'Array of player cards (yellow/red)';

-- Example of match_events structure:
-- [
--   {
--     "type": "try",
--     "team": "home",
--     "player": "John Smith",
--     "minute": 23,
--     "points": 5
--   }
-- ]

-- Example of player_cards structure:
-- [
--   {
--     "type": "yellow",
--     "team": "away",
--     "player": "James Wilson",
--     "minute": 45,
--     "reason": "High tackle"
--   }
-- ] 