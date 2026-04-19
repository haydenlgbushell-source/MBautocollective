/**
 * Microsoft Graph API client for Outlook calendar integration.
 *
 * Requires Azure app registration with:
 *  - Calendars.ReadWrite (Application permission)
 *  - Admin consent granted
 *
 * Env vars:
 *  MICROSOFT_TENANT_ID
 *  MICROSOFT_CLIENT_ID
 *  MICROSOFT_CLIENT_SECRET
 *  OUTLOOK_CALENDAR_EMAIL  (e.g. matt@mbautocollective.com)
 */

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

// Simple in-process token cache (reused across hot-reload in dev)
let _cache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (_cache && Date.now() < _cache.expiresAt - 30_000) {
    return _cache.token;
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Microsoft credentials not configured. Set MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET.'
    );
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microsoft token error: ${res.status} ${text}`);
  }

  const data: TokenResponse = await res.json();
  _cache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return _cache.token;
}

export interface GraphCalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

/**
 * Returns all calendar events for a given date (YYYY-MM-DD) in Sydney time.
 * Events are returned with start/end in Australia/Sydney time zone.
 */
export async function getCalendarEvents(date: string): Promise<GraphCalendarEvent[]> {
  const token = await getAccessToken();
  const email = process.env.OUTLOOK_CALENDAR_EMAIL;

  if (!email) throw new Error('OUTLOOK_CALENDAR_EMAIL not configured.');

  const url = new URL(`${GRAPH_BASE}/users/${encodeURIComponent(email)}/calendarView`);
  url.searchParams.set('startDateTime', `${date}T00:00:00`);
  url.searchParams.set('endDateTime', `${date}T23:59:59`);
  url.searchParams.set('$select', 'id,subject,start,end');
  url.searchParams.set('$top', '50');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'outlook.timezone="Australia/Sydney"',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph calendarView error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return (data.value ?? []) as GraphCalendarEvent[];
}

export interface CreateEventParams {
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM  (Sydney time)
  endTime: string;     // HH:MM  (Sydney time)
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  vehicleLabel: string;
}

/**
 * Creates a calendar event for the viewing appointment in the dealer's Outlook calendar.
 * Sends an invite to the customer's email address.
 */
export async function createCalendarEvent(params: CreateEventParams): Promise<GraphCalendarEvent> {
  const token = await getAccessToken();
  const email = process.env.OUTLOOK_CALENDAR_EMAIL;

  if (!email) throw new Error('OUTLOOK_CALENDAR_EMAIL not configured.');

  const res = await fetch(`${GRAPH_BASE}/users/${encodeURIComponent(email)}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'outlook.timezone="Australia/Sydney"',
    },
    body: JSON.stringify({
      subject: `Vehicle Viewing — ${params.vehicleLabel}`,
      body: {
        contentType: 'Text',
        content: [
          `Customer: ${params.customerName}`,
          `Email: ${params.customerEmail}`,
          params.customerPhone ? `Phone: ${params.customerPhone}` : null,
          '',
          `Vehicle: ${params.vehicleLabel}`,
          '',
          'Booked via MB Auto Collective website.',
        ]
          .filter((l) => l !== null)
          .join('\n'),
      },
      start: {
        dateTime: `${params.date}T${params.startTime}:00`,
        timeZone: 'Australia/Sydney',
      },
      end: {
        dateTime: `${params.date}T${params.endTime}:00`,
        timeZone: 'Australia/Sydney',
      },
      location: {
        displayName: '1/267 Young Street, Waterloo NSW 2017',
      },
      attendees: [
        {
          emailAddress: { address: params.customerEmail, name: params.customerName },
          type: 'required',
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph createEvent error: ${res.status} ${text}`);
  }

  return res.json() as Promise<GraphCalendarEvent>;
}
