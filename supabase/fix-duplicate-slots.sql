-- Run BEFORE calendar.sql if its unique index fails on duplicate time_slots.
-- Keeps one row per (barber, date, time) — preferring one that has a booking —
-- moves any bookings onto it, then deletes the extras.

-- 1. PREVIEW (read-only): which times are duplicated, and how many rows each has.
select barber_id, slot_date, start_time, count(*) as copies, bool_or(is_booked) as any_booked
from time_slots
group by barber_id, slot_date, start_time
having count(*) > 1
order by slot_date, start_time;

-- 2. FIX (runs as one transaction).
begin;

-- Point bookings at the row we're keeping.
with ranked as (
  select t.id,
    first_value(t.id) over (
      partition by t.barber_id, t.slot_date, t.start_time
      order by (b.slot_id is not null) desc, t.is_booked desc, t.id
    ) as keep_id
  from time_slots t
  left join (select distinct slot_id from bookings) b on b.slot_id = t.id
)
update bookings bk
set slot_id = r.keep_id
from ranked r
where bk.slot_id = r.id and r.id <> r.keep_id;

-- Delete the now-unreferenced duplicates.
with ranked as (
  select t.id,
    first_value(t.id) over (
      partition by t.barber_id, t.slot_date, t.start_time
      order by (b.slot_id is not null) desc, t.is_booked desc, t.id
    ) as keep_id
  from time_slots t
  left join (select distinct slot_id from bookings) b on b.slot_id = t.id
)
delete from time_slots t
using ranked r
where t.id = r.id and r.id <> r.keep_id;

commit;
