-- Run once in the Supabase SQL editor. Tracks which reminders have gone out.
alter table bookings
  add column if not exists morning_reminder_sent_at timestamptz,
  add column if not exists hour_reminder_sent_at timestamptz;
