# MB Auto Collective

Production website for MB Auto Collective — a prestige pre-owned car dealership in Waterloo, Sydney.

**Live site:** [mbautocollective.com](https://mbautocollective.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom dark luxury design tokens
- **Animations:** Framer Motion
- **Database:** Supabase (inventory + photo storage)
- **CRM:** HubSpot (leads and enquiries)
- **Hosting:** Vercel
- **Auth:** Supabase Auth (admin dashboard)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase and HubSpot credentials
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase-schema.sql`
3. Go to **Storage** → New bucket → `vehicle-photos` → toggle **Public ON**
4. Copy your project URL and anon key into `.env.local`

### 4. Set up HubSpot

1. Log in to [app.hubspot.com](https://app.hubspot.com)
2. Settings → Integrations → Private Apps → Create app
3. Required scopes: `crm.objects.contacts.write`, `crm.objects.deals.write`
4. Copy the access token into `.env.local`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin Dashboard

The admin dashboard lives at `/admin` and is protected by Supabase Auth.

To create an admin user:
1. Go to your Supabase project → **Authentication → Users → Add user**
2. Enter Matt's email and a strong password
3. Log in at `/admin/login`

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` in Vercel dashboard
4. Connect domain `mbautocollective.com` in Vercel → Settings → Domains

## Project Structure

```
app/                    # Next.js App Router pages
├── page.tsx            # Homepage
├── stock/              # Listings + vehicle detail
├── about/              # About page
├── contact/            # Contact page
├── finance/            # Finance page
├── car-valuation/      # Valuation form
├── admin/              # Protected admin dashboard
└── api/                # API routes (enquiry, vehicles, upload)
components/
├── home/               # Homepage sections
├── layout/             # Navbar, Footer
├── stock/              # VehicleCard, VehicleGrid, FilterBar
├── forms/              # EnquiryForm, ContactForm, ValuationForm
├── admin/              # VehicleForm, PhotoUploader
└── ui/                 # Button, Badge, Modal, CarSVG
lib/
├── supabase/           # DB client + vehicle helpers
├── hubspot/            # Enquiry → HubSpot integration
├── constants.ts        # Business details, reviews
└── utils.ts            # formatPrice, formatKm, generateSlug
types/
└── vehicle.ts          # TypeScript interfaces
```
