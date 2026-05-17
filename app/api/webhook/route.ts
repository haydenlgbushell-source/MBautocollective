import { NextRequest, NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/claude';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import {
  upsertContact,
  createDeal,
  createNote,
  createFollowUpTask,
} from '@/lib/hubspot/whatsapp-agent';
import { getSession, addMessage, updateSession } from '@/lib/session';

// ─── GET: Meta webhook verification ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// ─── POST: Incoming WhatsApp messages ──────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: WhatsAppWebhookPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only handle WhatsApp message events
  if (body?.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' });
  }

  try {
    await handleIncomingMessage(body);
  } catch (err) {
    // Log and return 200 so Meta doesn't retry indefinitely
    console.error('Webhook handler error:', err);
  }

  return NextResponse.json({ status: 'ok' });
}

// ─── Core message handler ───────────────────────────────────────────────────
async function handleIncomingMessage(body: WhatsAppWebhookPayload) {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  // Ignore non-text messages (images, audio, etc.)
  if (!message || message.type !== 'text') return;

  const from = message.from; // E.164 phone number
  const text = message.text?.body ?? '';
  const customerName = value?.contacts?.[0]?.profile?.name;

  const session = await getSession(from);
  const isFirstMessage = session.messages.length === 0;

  // ── 1. Get Claude's reply ────────────────────────────────────────────────
  const { reply, needsHuman } = await getAIResponse(session.messages, text);

  // ── 2. Persist conversation in session ──────────────────────────────────
  await addMessage(from, 'user', text);
  await addMessage(from, 'assistant', reply);

  // ── 3. Send reply via WhatsApp ───────────────────────────────────────────
  await sendWhatsAppMessage(from, reply);

  // ── 4. CRM logging (non-blocking failures) ──────────────────────────────
  try {
    let contactId = session.contactId;

    if (!contactId) {
      contactId = await upsertContact(from, customerName);
      await updateSession(from, { contactId, name: customerName });
    }

    // Detect conversation intent to choose HubSpot deal stage
    const lower = text.toLowerCase();
    const dealInfo = detectIntent(lower, customerName ?? from);

    if (dealInfo && !session.dealId) {
      const dealId = await createDeal(contactId, dealInfo.name, dealInfo.stage);
      await updateSession(from, { dealId });
    }

    if (isFirstMessage) {
      await createNote(
        contactId,
        `📱 WhatsApp conversation started via AI agent.\n\nCustomer: ${text}\nAssistant: ${reply}`,
      );
    }

    if (needsHuman) {
      const transcript = session.messages
        .map((m) => `${m.role === 'user' ? '👤 Customer' : '🤖 Assistant'}: ${m.content}`)
        .join('\n');

      await createNote(
        contactId,
        `⚠️ Needs Human Follow-Up — customer requested callback via WhatsApp.\n\n--- Transcript ---\n${transcript}\n\nCustomer message that triggered handoff: ${text}`,
      );

      await createFollowUpTask(
        contactId,
        `📞 Call back WhatsApp customer — ${customerName ?? from}`,
      );
    }
  } catch (crmErr) {
    console.error('CRM error (non-fatal):', crmErr);
  }
}

// ─── Intent detection for HubSpot deal creation ────────────────────────────
function detectIntent(
  lower: string,
  label: string,
): { name: string; stage: string } | null {
  if (/\b(buy|buying|purchase|looking for|want a car|need a car|find me)\b/.test(lower)) {
    return { name: `WhatsApp Buy Enquiry — ${label}`, stage: 'appointmentscheduled' };
  }
  if (/\b(sell|selling|trade.?in|trade in|my car|swap)\b/.test(lower)) {
    return { name: `WhatsApp Trade-In — ${label}`, stage: 'qualifiedtobuy' };
  }
  if (/\b(view|viewing|inspect|come in|book|appointment|test drive)\b/.test(lower)) {
    return { name: `WhatsApp Viewing Request — ${label}`, stage: 'presentationscheduled' };
  }
  return null;
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface WhatsAppWebhookPayload {
  object: string;
  entry?: {
    id: string;
    changes?: {
      value?: {
        messaging_product: string;
        contacts?: { profile?: { name?: string } }[];
        messages?: {
          from: string;
          id: string;
          type: string;
          text?: { body: string };
        }[];
      };
    }[];
  }[];
}
