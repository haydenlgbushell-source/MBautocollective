import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/microsoft/graph';
import { createAdminClient } from '@/lib/supabase/server';

// Business hours: 9 AM – 4 PM start (last slot 4–5 PM), Mon–Sat
const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatLabel(hour: number) {
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}

/**
 * Returns whether a 1-hour slot starting at `slotHour` overlaps with an event.
 * All times are expressed as decimal hours in Sydney local time (e.g. 9.5 = 9:30 AM).
 */
function overlaps(slotHour: number, eventStartHour: number, eventEndHour: number): boolean {
  return eventStartHour < slotHour + 1 && eventEndHour > slotHour;
}

/** Parse "HH:MM:SS.sss" or "HH:MM:SS" into a decimal hour number */
function parseHour(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h + m / 60;
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  // Reject past dates (compare calendar date only)
  const [year, month, day] = date.split('-').map(Number);
  const requested = new Date(year, month - 1, day);
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  if (requested < todayLocal) {
    return NextResponse.json({ slots: [] });
  }

  // Sundays closed
  if (requested.getDay() === 0) {
    return NextResponse.json({ slots: [] });
  }

  // For today: figure out current Sydney hour to block past slots.
  // We compare using Sydney offset (UTC+10 standard / +11 daylight).
  // Using a simple heuristic: get current UTC hour and add 10. If the
  // server is running in UTC this is correct for AEST; AEDT adds 1 more.
  const nowSydneyHour = (() => {
    const now = new Date();
    // Use Intl to get Sydney local hour robustly
    try {
      const parts = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Sydney',
        hour: 'numeric',
        hour12: false,
      }).formatToParts(now);
      const h = parts.find((p) => p.type === 'hour');
      return h ? parseInt(h.value, 10) : 0;
    } catch {
      return now.getUTCHours() + 10; // fallback
    }
  })();

  const isToday =
    requested.getFullYear() === todayLocal.getFullYear() &&
    requested.getMonth() === todayLocal.getMonth() &&
    requested.getDate() === todayLocal.getDate();

  try {
    const supabase = await createAdminClient();

    // Fetch already-confirmed bookings for this date from Supabase
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('slot_time')
      .eq('booking_date', date)
      .eq('status', 'confirmed');

    const bookedSlotTimes = new Set(
      (existingBookings ?? []).map((b: { slot_time: string }) => b.slot_time)
    );

    // Fetch Outlook calendar events (may throw if not configured)
    let busyHours: Array<{ start: number; end: number }> = [];
    try {
      const events = await getCalendarEvents(date);
      busyHours = events.map((ev) => ({
        start: parseHour(ev.start.dateTime.split('T')[1]),
        end: parseHour(ev.end.dateTime.split('T')[1]),
      }));
    } catch (err) {
      // If Outlook creds aren't set up, gracefully degrade to Supabase-only checks
      console.warn('Outlook calendar fetch skipped:', (err as Error).message);
    }

    const slots = SLOT_HOURS.filter((hour) => {
      const slotTime = `${pad(hour)}:00`;

      // Block past slots when showing today
      if (isToday && hour <= nowSydneyHour) return false;

      // Block slots already booked in Supabase
      if (bookedSlotTimes.has(slotTime)) return false;

      // Block slots that overlap an Outlook event
      if (busyHours.some(({ start, end }) => overlaps(hour, start, end))) return false;

      return true;
    }).map((hour) => ({
      time: `${pad(hour)}:00`,
      label: formatLabel(hour),
    }));

    return NextResponse.json({ slots });
  } catch (err) {
    console.error('Booking slots error:', err);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
