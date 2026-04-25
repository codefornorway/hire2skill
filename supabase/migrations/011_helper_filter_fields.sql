-- Add explicit helper discovery/filter fields.
-- These fields replace bio-heuristic matching for language/tools/invoice filters.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS brings_tools boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_invoice boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.languages IS 'Languages helper can use with clients, e.g. no,en';
COMMENT ON COLUMN public.profiles.brings_tools IS 'Whether helper brings own tools/equipment';
COMMENT ON COLUMN public.profiles.can_invoice IS 'Whether helper can invoice (typically VAT/business)';

