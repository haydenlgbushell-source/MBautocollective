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

---

## WhatsApp AI Agent

An AI-powered WhatsApp assistant that handles inbound customer messages, routes enquiries to HubSpot, and escalates to the team when needed. Powered by Claude.

### How it works

1. Customer sends a WhatsApp message to the MB Auto Collective business number
2. Meta Cloud API forwards it to `POST /api/webhook`
3. Claude (with dealership system prompt + conversation history) generates a reply
4. Reply is sent back to the customer via WhatsApp
5. Contact, Deal, and Notes are created/updated in HubSpot automatically

### Conversation topics handled

| Topic | HubSpot Deal Stage |
|---|---|
| Buying a car | New Lead (appointmentscheduled) |
| Selling / Trade-in | Trade-In Enquiry (qualifiedtobuy) |
| Booking a viewing | Viewing Requested (presentationscheduled) |
| Human handoff | Needs Human Follow-Up task + note |

### Setup — step by step

#### 1. Add environment variables

Add these to your Vercel project under **Settings → Environment Variables**, and also copy them into `.env.local` for local development:

```
ANTHROPIC_API_KEY=sk-ant-...
WHATSAPP_TOKEN=<Meta Cloud API access token>
WHATSAPP_VERIFY_TOKEN=<any string you choose, e.g. mbautocollective_webhook_2025>
WHATSAPP_PHONE_NUMBER_ID=<from Meta developer portal>
HUBSPOT_API_KEY=<HubSpot Private App token>
```

#### 2. HubSpot Private App scopes

When creating your HubSpot Private App, enable these scopes:

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.write`
- `crm.objects.notes.write`
- `crm.objects.tasks.write`

#### 3. Meta App — WhatsApp product setup

1. Go to [developers.facebook.com](https://developers.facebook.com) and open your app (or create one with **WhatsApp** as the product).
2. In the left sidebar: **WhatsApp → API Setup**
   - Note your **Phone Number ID** → paste into `WHATSAPP_PHONE_NUMBER_ID`
   - Generate or copy the **Access Token** → paste into `WHATSAPP_TOKEN`
3. In the left sidebar: **WhatsApp → Configuration → Webhooks**
   - Click **Edit**
   - **Callback URL:** `https://mbautocollective.com/api/webhook`
   - **Verify Token:** the value you set for `WHATSAPP_VERIFY_TOKEN`
   - Click **Verify and Save** (your Vercel deployment must be live at this point)
4. Under **Webhook Fields**, subscribe to **messages**

#### 4. Deploy to Vercel

```bash
git push origin claude/whatsapp-ai-agent-KEk82
```

Then in Vercel:
1. Import/connect the repo if not already done
2. Add all environment variables listed above
3. Redeploy

#### 5. Test the webhook verification

After deploying, visit:

```
https://mbautocollective.com/api/webhook?hub.mode=subscribe&hub.verify_token=<YOUR_VERIFY_TOKEN>&hub.challenge=test123
```

You should see `test123` returned — this confirms the endpoint is live and the token matches.

#### 6. Send a test message

Send a WhatsApp message to your business number. You should receive a reply from the assistant within a few seconds.

### File structure

```
app/api/webhook/route.ts       # GET (Meta verification) + POST (message handler)
lib/claude.ts                  # Claude API client + system prompt
lib/whatsapp.ts                # Send messages via Meta Cloud API
lib/hubspot/whatsapp-agent.ts  # Contact, Deal, Note, Task helpers
lib/session.ts                 # In-memory conversation history per phone number
```

### Known limitation — session memory

In-memory sessions persist only within a single warm Vercel function instance. For production reliability, replace the `Map` in `lib/session.ts` with [Upstash Redis](https://upstash.com) or a Supabase table so sessions survive cold starts and concurrent instances.

---

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
