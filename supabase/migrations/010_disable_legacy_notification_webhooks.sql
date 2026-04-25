-- Consolidate notifications to Next.js `/api/notify`.
-- Disable old DB->Edge webhook triggers to prevent duplicate emails/pushes.

DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_booking_accepted ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;

DROP FUNCTION IF EXISTS public.trg_notify_new_booking();
DROP FUNCTION IF EXISTS public.trg_notify_booking_accepted();
DROP FUNCTION IF EXISTS public.trg_notify_new_message();
