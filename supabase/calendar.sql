-- Run once in the Supabase SQL editor (after reminders.sql).
alter table bookings
  add column if not exists stripe_session_id text,
  add column if not exists google_event_id text;

-- One booking per Stripe payment, so refreshing the success page can't double-book.
create unique index if not exists bookings_stripe_session_id_key
  on bookings (stripe_session_id) where stripe_session_id is not null;

-- Two people can't take the same start time. (Fails if duplicate slot rows already exist.)
create unique index if not exists time_slots_barber_date_time_key
  on time_slots (barber_id, slot_date, start_time);
