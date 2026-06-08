# ✂️ Barbershop Booking

A full-stack appointment booking web app for barbershops — built with Next.js, Supabase, Tailwind CSS, and Resend.

Customers can browse services, choose a barber, pick an available time slot, and receive an email confirmation after booking.

---

## Features

- Browse available services and barbers
- Real-time slot availability — slots update as bookings are made
- Booking confirmation emails via Resend
- Admin view to manage appointments
- Fully responsive design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Email | [Resend](https://resend.com/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Database Schema

```
barbers       → id, name, bio, created_at
services      → id, name, duration_minutes, price
time_slots    → id, barber_id, slot_date, start_time, is_booked
bookings      → id, slot_id, service_id, customer_name, customer_email, created_at
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com) account
- A [Resend](https://resend.com) account

### Installation

1. Clone the repo
```bash
git clone https://github.com/aaryavulupala/barbershop-booking.git
cd barbershop-booking
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables — create a `.env.local` file at the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

4. Set up the database — run the following in your Supabase SQL Editor:
```sql
create table barbers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  created_at timestamp default now()
);

create table services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  duration_minutes int not null,
  price numeric not null
);

create table time_slots (
  id uuid default gen_random_uuid() primary key,
  barber_id uuid references barbers(id),
  slot_date date not null,
  start_time time not null,
  is_booked boolean default false
);

create table bookings (
  id uuid default gen_random_uuid() primary key,
  slot_id uuid references time_slots(id),
  service_id uuid references services(id),
  customer_name text not null,
  customer_email text not null,
  created_at timestamp default now()
);
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
barbershop-booking/
├── app/                  # Next.js App Router pages
├── lib/
│   └── supabase.js       # Supabase client
├── components/           # Reusable UI components
├── .env.local            # Environment variables (not committed)
└── README.md
```

---

## Roadmap

- [x] Project setup and database schema
- [ ] Booking flow UI (service → barber → time slot → confirm)
- [ ] Email confirmations via Resend
- [ ] Admin dashboard
- [ ] Slot conflict prevention
- [ ] Deployment to Vercel

---

## License

MIT
