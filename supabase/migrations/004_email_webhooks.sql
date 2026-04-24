-- Email notification webhooks via pg_net (Supabase built-in extension)
-- Replace <PROJECT_REF> and <SUPABASE_ANON_KEY> before running.
-- Find them in: Settings → General (ref) and Settings → API (anon key)

-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ──────────────────────────────────────────────────────────────────────────────
-- Helper: call an edge function asynchronously (fire-and-forget)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.call_edge_function(
  function_name text,
  payload       jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  project_ref  text := '<PROJECT_REF>';
  anon_key     text := '<SUPABASE_ANON_KEY>';
  url          text;
BEGIN
  url := 'https://' || project_ref || '.supabase.co/functions/v1/' || function_name;
  PERFORM net.http_post(
    url         := url,
    body        := payload::text,
    headers     := jsonb_build_object(
                     'Content-Type', 'application/json',
                     'Authorization', 'Bearer ' || anon_key
                   )
  );
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: new booking → notify helper
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_notify_new_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.call_edge_function(
    'notify-new-booking',
    jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)::jsonb,
      'old_record', NULL
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;
CREATE TRIGGER trg_notify_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_new_booking();

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: booking accepted → notify poster
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_notify_booking_accepted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    PERFORM public.call_edge_function(
      'notify-booking-accepted',
      jsonb_build_object(
        'type', 'UPDATE',
        'record', row_to_json(NEW)::jsonb,
        'old_record', row_to_json(OLD)::jsonb
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_booking_accepted ON public.bookings;
CREATE TRIGGER trg_notify_booking_accepted
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_booking_accepted();

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: new message → notify recipient
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_notify_new_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.call_edge_function(
    'notify-new-message',
    jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)::jsonb,
      'old_record', NULL
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_new_message();
