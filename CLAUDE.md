# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MB Auto Collective** is a prestige pre-owned car dealership website for Waterloo, Sydney. The app allows customers to:
- Browse available vehicles with detailed specifications and photos
- Submit enquiries and valuations
- Request car sourcing services

The admin dashboard enables dealers to:
- Manage vehicle inventory (add, edit, delete listings)
- Import vehicles from EasyCars DMS
- Generate and publish social media content to Facebook, Instagram, and LinkedIn
- View enquiry analytics and leads from HubSpot

**Live site:** https://mbautocollective.com

## Tech Stack & Key Dependencies

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS (dark luxury theme with gold accents)
- **Animations:** Framer Motion
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (vehicle photos)
- **CRM Integration:** HubSpot (contacts, deals, form submissions)
- **Social Publishing:** Meta Graph API (Facebook/Instagram), LinkedIn API
- **Image Generation:** Anthropic Claude API (via `/api/easycars-agent`)
- **Web Scraping:** Puppeteer Core + EasyCars DMS integration

## Build & Run Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint & type check
npm run lint

# Type check (implicit during lint & build)
npx tsc --noEmit
```

## Environment Setup

Copy `.env.example` to `.env.local` and populate:
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **HubSpot:** `HUBSPOT_ACCESS_TOKEN`, `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`, form GUIDs
- **Social:** `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORGANIZATION_ID`
- **EasyCars:** `EASYCARS_EMAIL`, `EASYCARS_PASSWORD`
- **Claude API:** `ANTHROPIC_API_KEY` (for EasyCars agent)

## Database Schema

Run `/supabase-schema.sql` in Supabase SQL Editor once. Key tables:

- **vehicles** - Car listings (id, slug, make, model, year, price, kilometres, transmission, fuel_type, body_type, features, photos, status, featured, stock_number, vin, etc.)
- **enquiries** - Lead backups from website forms (HubSpot is primary)
- **app_settings** - Key-value store for EasyCars session persistence (service-role only)

Row-level security (RLS) enabled:
- Public can read vehicles with status = 'available|sold|reserved'
- Authenticated users (admin) have full access

## Architecture & Data Flows

### 1. Public Website (Customer Facing)

**Pages:** `/` (home), `/stock` (listings), `/stock/[slug]` (detail), `/contact`, `/about`, `/car-valuation`, `/car-sourcing`, `/finance`

- Fetch available vehicles from Supabase (revalidate every 60s)
- Display vehicle grids, search/filter UI, feature highlights
- Forms (enquiry, contact, valuation, car-sourcing) → HubSpot + Supabase enquiries table

**Key components:**
- `components/home/*` - Hero, FeaturedStock, SearchSection, ReviewsSection
- `components/stock/*` - VehicleGrid, FilterBar, VehicleCard
- `components/forms/*` - EnquiryForm, ContactForm, ValuationForm, CarSourcingForm

### 2. Admin Dashboard (Protected by Supabase Auth)

**Pages:** `/admin` (dashboard), `/admin/inventory` (CRUD), `/admin/social-pack` (publishing), `/admin/leads` (HubSpot), `/admin/easycars` (scraper)

- **Middleware** (`middleware.ts`) enforces auth on all `/admin/*` routes (redirects to `/admin/login` if not authenticated)
- Admin users created via Supabase console

**Key admin workflows:**

#### Vehicle Management
- Add/edit vehicles → `POST/PUT /api/vehicles`
- Photo upload → `POST /api/upload` → Supabase Storage
- Generate slug from `{year}-{make}-{model}-{variant}`
- Mark as featured, change status (available/reserved/sold)

#### Social Media Pack Generation
- `/admin/social-pack` page queries social_packs table (Supabase)
- **Generate** button → `POST /api/easycars-agent` with vehicle details
  - Calls Anthropic Claude API to generate captions, hashtags, photo orders for multiple platforms (Instagram, Facebook, LinkedIn, TikTok)
  - Stores results in `social_packs` table with status = 'pending'
- **Edit pack** inline — edit text, reorder photos, select Instagram variant
- **Publish** → routes to platform-specific endpoints:
  - Facebook: `lib/platforms/facebook.ts` → Meta Graph API
  - Instagram: Shares to Instagram via Facebook page
  - LinkedIn: `lib/platforms/linkedin.ts` → LinkedIn API
  - Results stored in `publish_results` JSONB column

#### EasyCars Integration (Auto-Import)
- `/admin/easycars` page for manual screenshot upload or DMS session management
- **Import from screenshot:** Upload PNG/JPEG → OCR via Claude API → extract vehicle details → upsert to vehicles table
- **Connect session:** Paste EasyCars session cookies → persist in `app_settings` → use to auto-fetch listings
- Flow: Upload/scrape → Extract specs & features → Check for duplicates (by stock_number/VIN) → INSERT or UPDATE vehicles

### 3. API Routes

- `POST /api/vehicles` - Create vehicle (requires admin context)
- `GET /api/vehicles` - List all (no auth; filtered by RLS at DB)
- `POST /api/enquiry` - Submit enquiry form → HubSpot + Supabase backup
- `POST /api/upload` - Upload photo → Supabase Storage
- `POST /api/easycars-agent` - Generate social pack via Claude API
- `POST /api/easycars-agent/scrape` - Auto-scrape EasyCars DMS
- `POST /api/easycars-agent/push` - Push vehicles to EasyCars
- `POST /api/easycars-agent/save-session` - Persist session cookies
- `POST /api/deal` - Sync HubSpot deals (unused; for future expansions)

### 4. HubSpot Integration

**Enquiry flow:** Website form → `lib/hubspot/enquiries.ts` → HubSpot API

- Creates contact + associated deal in "Car Sales Pipeline" (ID: 1680745971)
- Deal stage based on form type: enquiry, valuation, sourcing, contact
- Also logs to Supabase `enquiries` table as backup
- `lib/hubspot/forms.ts` handles form submissions via HubSpot Forms API (for analytics)

### 5. Social Publishing

Publish social packs to platforms via platform adapters:

- **Facebook:** `lib/platforms/facebook.ts` → Meta Graph API (create post with photo carousel)
- **Instagram:** Uses Facebook API to publish via Instagram Business Account
- **LinkedIn:** `lib/platforms/linkedin.ts` → LinkedIn Share API (text + single image)

Results stored as `PublishResults` (success/error per platform) in `social_packs.publish_results`.

## Type System

Core types in `/types`:

- **`Vehicle`** - Full vehicle record from DB
- **`VehicleInsert`** - Create payload (required: make, model, year, price; others optional)
- **`VehicleUpdate`** - Partial update payload
- **`Enquiry`** - Enquiry record (vehicle_id, name, email, phone, message)
- **`SocialPack`** - Social media content bundle (captions, hashtags, photo orders, publish results for each platform)

## Code Organization

```
app/                    # Next.js App Router
├── page.tsx            # Homepage
├── layout.tsx          # Root layout (fonts, viewport, metadata)
├── middleware.ts       # Auth check for /admin routes
├── stock/[slug]/       # Vehicle detail pages
├── admin/              # Protected admin routes
│   ├── inventory/      # Add, edit, delete vehicles
│   ├── social-pack/    # Generate & publish to social
│   ├── leads/          # HubSpot CRM integration
│   ├── easycars/       # EasyCars import
│   └── login/          # Supabase auth entry
└── api/                # API routes (vehicles, upload, enquiry, etc.)

components/            # React components
├── home/              # Homepage sections (Hero, SearchSection, etc.)
├── stock/             # Vehicle listing components
├── forms/             # Enquiry, contact, valuation forms
├── admin/             # Admin UI (VehicleForm, PhotoUploader, SocialPackCard)
├── layout/            # Navbar, Footer, CustomCursor
└── ui/                # Buttons, Badges, Modals, custom UI

lib/
├── supabase/          # DB client + vehicle queries
├── hubspot/           # Enquiry & form submission logic
├── platforms/         # Facebook, LinkedIn publish adapters
├── constants.ts       # Business info, feature categories, validation enums
├── utils.ts           # formatPrice, formatKm, generateSlug, cn()

types/
├── vehicle.ts         # Vehicle & Enquiry types
└── social.ts          # SocialPack, PublishResults types
```

## Supabase Configuration

1. Create project at supabase.com
2. Run schema SQL in dashboard → SQL Editor
3. Create `vehicle-photos` storage bucket with public access enabled
4. Enable RLS on tables (already in schema)
5. Copy project URL and keys to `.env.local`

**Storage URL pattern:** `https://<project-id>.supabase.co/storage/v1/object/public/vehicle-photos/<filename>`

Next.js is configured to accept remote images from Supabase (see `next.config.ts`).

## HubSpot Configuration

1. Settings → Integrations → Private Apps → Create app
2. Required scopes: `crm.objects.contacts.write`, `crm.objects.deals.write`
3. Copy access token to `HUBSPOT_ACCESS_TOKEN`
4. Find Portal ID from app URL: `app-ap1.hubspot.com/portal/<ID>`
5. For forms: Marketing → Forms → select form → Share → Embed Code → extract `formId` GUID
6. Add form GUIDs to env: `NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID`, etc.

## Vehicle Upload Workflow

Use `/admin/inventory/new` or the `upload-car` skill to add vehicles to Supabase:

1. **Parse title** → Extract year, make, model, body_type, variant
2. **Normalize specs:**
   - Transmission: 'Automatic' | 'Manual'
   - Fuel: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'
   - Body type: Sedan | SUV | Coupé | Convertible | Wagon | Hatchback | Ute
3. **Process features** → Match against `STANDARD_FEATURES` (from `lib/constants.ts`), keep unmatched as custom features
4. **Check duplicates** → Query by stock_number or VIN; UPDATE if exists, INSERT if new
5. **Generate slug** → `{year}-{make}-{model}-{variant}` → lowercase, spaces→hyphens, check uniqueness, append `-2`, `-3` if taken

See `.claude/commands/upload-car.md` for detailed feature mappings and SQL workflows.

## Deployment

**Vercel configuration** (`vercel.json`):
- Deploy to Sydney region (`syd1`)
- Next.js build with optimized serverless functions
- Security headers enabled (nosniff, no-framing, XSS protection)
- API routes bypass cache (`no-store`)

**Environment variables** must be set in Vercel dashboard (Supabase keys, HubSpot token, API keys).

## Design System

**Colors** (dark luxury theme):
- Background: `#0a0a0a` (bg-bg), `#111111` (bg-2), `#1c1c1e` (bg-3)
- Gold accent: `#b8963e` (gold), `#d4af6a` (gold-hi), `#7a6428` (gold-lo)
- Text: `#f5f2ed` (text), `#a09890` (text-2), `#878177` (text-3)
- Borders: `rgba(184,150,62,0.25)` (border), `rgba(184,150,62,0.4)` (border-2)

**Fonts:**
- Display: Cormorant Garamond (serif, luxe)
- Body: Montserrat (sans-serif)
- Mono: DM Mono (monospace)
- Border radius: 0 (hard edges; set `rounded-full` for circles)

## Common Development Tasks

**Add a new public page:**
1. Create folder under `app/` (e.g., `app/finance/page.tsx`)
2. Import Navbar & Footer from `components/layout`
3. Fetch data server-side if needed; set `revalidate = 60` for ISR

**Add vehicle filter/search:**
- Update `components/stock/FilterBar.tsx` to capture filters
- Pass to `/stock?make=...&model=...&year=...` as query params
- Server component reads params and filters vehicle list

**Add a new form:**
1. Create form component in `components/forms/`
2. On submit, call `createHubSpotEnquiry()` from `lib/hubspot/enquiries.ts`
3. Also log to Supabase `enquiries` table for backup
4. Show success toast via Framer Motion

**Publish social pack to new platform:**
1. Add platform adapter to `lib/platforms/` (e.g., `tiktok.ts`)
2. Implement `publishToTikTok(socialPack: SocialPack): Promise<PublishResults>`
3. Add to publish loop in `/admin/social-pack/actions.ts`
4. Update `SocialPack` type to include platform data (captions, hashtags)

## Important Notes

- **RLS enforcement:** Supabase RLS policies control data visibility. Public users can only read vehicles with status = 'available|sold|reserved'. Server-side code uses `createAdminClient()` with service role key for unrestricted access.
- **Slug uniqueness:** DB has unique constraint on `vehicles.slug`. Code handles collisions by appending random suffixes (e.g., `-xyz3`).
- **Photo storage:** Photos stored in Supabase `vehicle-photos` bucket. Each vehicle can have multiple photos (stored as array of URLs in `photos` column).
- **EasyCars scraping:** Uses masked Puppeteer to bypass bot detection. Session cookies persisted in `app_settings` table to avoid repeated logins.
- **ISR strategy:** Homepage revalidates every 60s to keep featured inventory fresh without requiring full rebuild.
- **Social pack generation:** Anthropic Claude API call is async; UI shows "pending" status while generation completes. Results include warnings for quality issues (e.g., too-long caption).
