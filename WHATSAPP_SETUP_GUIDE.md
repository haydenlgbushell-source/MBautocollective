# WhatsApp AI Agent — Go-Live Checklist
MB Auto Collective | Waterloo, Sydney NSW

Work through this top to bottom. Each section has a checkbox.
Estimated time: 30–45 minutes (plus 1–5 days waiting for Meta verification).

---

## PART 1 — Upstash Redis (5 min)

Session memory for the AI agent. Free tier is plenty.

- [ ] Go to https://console.upstash.com
- [ ] Click **Sign Up** → sign up with Google or email
- [ ] Click **Create Database**
  - Name: `mb-whatsapp-sessions`
  - Type: **Regional**
  - Region: **ap-southeast-1** (Singapore — closest to Sydney)
  - Click **Create**
- [ ] Click into your new database
- [ ] Click the **REST API** tab
- [ ] Copy **UPSTASH_REDIS_REST_URL** → paste somewhere safe
- [ ] Copy **UPSTASH_REDIS_REST_TOKEN** → paste somewhere safe

✅ Done when you have both values saved.

---

## PART 2 — Meta Developer App (20 min)

### 2a — Meta Business Account

- [ ] Go to https://business.facebook.com
- [ ] Click **Create Account** (top right)
  - Business name: `MB Auto Collective`
  - Your name and work email
  - Click **Submit**
- [ ] Verify your email when Meta sends a confirmation

> If you already have a Meta Business Account, skip to 2b.

### 2b — Create the Developer App

- [ ] Go to https://developers.facebook.com
- [ ] Click **My Apps** (top right) → **Create App**
- [ ] Select **Business** → click **Next**
  - App name: `MB Auto Collective WhatsApp`
  - App contact email: your email
  - Business Account: select the one you just created
  - Click **Create App**
- [ ] You'll land on the **Add Products** screen
- [ ] Find **WhatsApp** → click **Set Up**

### 2c — Get your test credentials

You're now inside your app. In the **left sidebar**:

- [ ] Click **WhatsApp** → **API Setup**
- [ ] Under **Step 1 — Select phone numbers** you'll see:
  - A **From** number (Meta's test number — you don't own this, that's fine)
  - A **Phone Number ID** shown below it → **copy this** → save as `WHATSAPP_PHONE_NUMBER_ID`
- [ ] Under **Step 2 — Send messages with the API**:
  - There's a temporary **Access Token** → **copy this** → save as `WHATSAPP_TOKEN`
  - ⚠️ This expires in 24 hours — fine for testing, you'll replace it later
- [ ] Under **To**, enter your own mobile number (in +61 format, e.g. +61412345678)
- [ ] Click **Send Message** — you should receive a WhatsApp message on your phone
  - If it arrives, the API is working ✅

### 2d — Configure the webhook

Still in the left sidebar:

- [ ] Click **WhatsApp** → **Configuration**
- [ ] Scroll to **Webhook** section → click **Edit**
  - **Callback URL:** `https://mbautocollective.com/api/webhook`
  - **Verify Token:** type a string you'll remember, e.g. `mbautocollective2025`
    - Write this down → save as `WHATSAPP_VERIFY_TOKEN`
  - Click **Verify and Save**
  - ⚠️ This will FAIL if Vercel isn't deployed yet — do Part 3 first, then come back
- [ ] After saving, click **Manage** next to Webhook Fields
- [ ] Find **messages** → toggle it ON → click **Done**

✅ Done when webhook shows "Configured" and messages field is subscribed.

---

## PART 3 — HubSpot Private App (5 min)

- [ ] Log in to https://app.hubspot.com
- [ ] Top right → click your **account name** → **Settings** (gear icon)
- [ ] Left sidebar → **Integrations** → **Private Apps**
- [ ] Click **Create a private app**
  - Name: `WhatsApp AI Agent`
  - Description: `MB Auto Collective WhatsApp webhook integration`
- [ ] Click the **Scopes** tab and enable ALL of these:
  - `crm.objects.contacts.read`
  - `crm.objects.contacts.write`
  - `crm.objects.deals.write`
  - `crm.objects.notes.write`
  - `crm.objects.tasks.write`
- [ ] Click **Create App** → **Continue Creating**
- [ ] Copy the **Access Token** shown → save as `HUBSPOT_API_KEY`

> If you already have a Private App from the existing site integration,
> you can edit it and add the extra scopes instead of creating a new one.

✅ Done when you have the token saved.

---

## PART 4 — Vercel Environment Variables (5 min)

- [ ] Go to https://vercel.com → open the **mb-auto-collective** project
- [ ] Click **Settings** → **Environment Variables**
- [ ] Add each of the following (set Environment to **Production, Preview, Development**):

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your existing key (already in project) |
| `HUBSPOT_API_KEY` | From Part 3 |
| `WHATSAPP_TOKEN` | From Part 2c |
| `WHATSAPP_VERIFY_TOKEN` | The string you chose in Part 2d |
| `WHATSAPP_PHONE_NUMBER_ID` | From Part 2c |
| `UPSTASH_REDIS_REST_URL` | From Part 1 |
| `UPSTASH_REDIS_REST_TOKEN` | From Part 1 |

- [ ] After adding all 7, click **Deployments** → find the latest → click **Redeploy**
- [ ] Wait for the build to go green ✅

---

## PART 5 — Test the live webhook (5 min)

### Verify the endpoint is reachable

- [ ] Open this URL in your browser (replace the token with yours):
  ```
  https://mbautocollective.com/api/webhook?hub.mode=subscribe&hub.verify_token=mbautocollective2025&hub.challenge=hello123
  ```
- [ ] You should see `hello123` returned as plain text
- [ ] If you see `Forbidden` → the verify token doesn't match what's in Vercel

### Go back to Meta and save the webhook

- [ ] Return to developers.facebook.com → your app → WhatsApp → Configuration
- [ ] If you couldn't save the webhook in Part 2d (because Vercel wasn't deployed yet), do it now:
  - Click **Edit** → enter callback URL + verify token → **Verify and Save**
  - Click **Manage** → enable **messages** → Done

### Send a test message

- [ ] WhatsApp your business number from your personal phone
- [ ] You should receive an AI reply within a few seconds
- [ ] Check HubSpot Contacts — a new contact should appear with your phone number

---

## PART 6 — Add your real WhatsApp number (when ready)

> Do this after Meta Business Verification is approved (Part 7).
> Until then, only numbers you manually whitelist can message the test number.

- [ ] developers.facebook.com → your app → WhatsApp → API Setup
- [ ] Click **Add phone number**
  - Display name: `MB Auto Collective`
  - Category: **Automotive**
  - Enter a phone number that is NOT currently on WhatsApp
    (new SIM, or your existing dealership landline/mobile if not on WhatsApp)
  - Verify via SMS or voice call
- [ ] Once added, update `WHATSAPP_PHONE_NUMBER_ID` in Vercel with the new number's ID
- [ ] Redeploy

---

## PART 7 — Meta Business Verification (1–5 business days)

This unlocks messaging to any number (not just whitelisted testers).

- [ ] Go to https://business.facebook.com → Settings (gear icon, top left)
- [ ] Left sidebar → **Security Centre**
- [ ] Click **Start Verification** under Business Verification
- [ ] Fill in your business details:
  - Legal business name: `MB Auto Collective`
  - Country: Australia
  - ABN: your ABN number
- [ ] Upload documents when prompted:
  - **Option A:** ABN certificate from abr.business.gov.au (print to PDF)
  - **Option B:** A utility bill or bank statement showing the business name + address
- [ ] Submit and wait — Meta emails you when approved

---

## PART 8 — Permanent access token (after verification)

Replace the 24-hour test token with one that never expires.

- [ ] Go to https://business.facebook.com → Settings → **System Users**
- [ ] Click **Add** → create a System User
  - Name: `WhatsApp Agent`
  - Role: **Admin**
- [ ] Click **Generate New Token**
  - Select your app (`MB Auto Collective WhatsApp`)
  - Enable these permissions:
    - `whatsapp_business_messaging`
    - `whatsapp_business_management`
  - Click **Generate Token** → copy it
- [ ] Go to Vercel → Settings → Environment Variables
- [ ] Update `WHATSAPP_TOKEN` with the new permanent token
- [ ] Redeploy

---

## Quick reference — all credentials in one place

Fill this in as you go. Keep it somewhere secure (not in the repo).

```
ANTHROPIC_API_KEY        = sk-ant-...
HUBSPOT_API_KEY          = pat-...
WHATSAPP_TOKEN           = EAA...
WHATSAPP_VERIFY_TOKEN    = (your chosen string)
WHATSAPP_PHONE_NUMBER_ID = (numeric, e.g. 123456789012345)
UPSTASH_REDIS_REST_URL   = https://...upstash.io
UPSTASH_REDIS_REST_TOKEN = AX...
```

---

## If something goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Webhook verify returns `Forbidden` | Token mismatch | Check `WHATSAPP_VERIFY_TOKEN` in Vercel matches exactly what you typed in Meta |
| No AI reply to WhatsApp message | Vercel function error | Vercel dashboard → Logs → look for errors |
| Reply arrives but HubSpot contact not created | Wrong HubSpot token or missing scopes | Re-check Private App scopes |
| `Session not found` errors | Upstash credentials wrong | Double-check URL and token from Upstash REST API tab |
| Meta webhook save fails | Vercel not deployed yet | Deploy first, then come back to Meta |

---

*Generated for MB Auto Collective — Waterloo, Sydney NSW*
