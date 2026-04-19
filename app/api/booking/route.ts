import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/microsoft/graph';
import { createAdminClient } from '@/lib/supabase/server';
import { createHubSpotEnquiry } from '@/lib/hubspot/enquiries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, slotTime, vehicle } = body;

    if (!name || !email || !date || !slotTime) {
      return NextResponse.json(
        { error: 'Name, email, date and time slot are required.' },
        { status: 400 }
      );
    }

    // Calculate end time (1 hour after start)
    const [hours] = slotTime.split(':').map(Number);
    const endTime = `${String(hours + 1).padStart(2, '0')}:00`;

    const vehicleLabel = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`
      : 'Vehicle Viewing';

    // 1. Create Outlook calendar event (non-blocking — don't fail if creds missing)
    let calendarEventId: string | null = null;
    try {
      const event = await createCalendarEvent({
        date,
        startTime: slotTime,
        endTime,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        vehicleLabel,
      });
      calendarEventId = event.id;
    } catch (err) {
      console.error('Outlook calendar event creation failed (non-fatal):', err);
    }

    // 2. Save to Supabase bookings table
    const supabase = await createAdminClient();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        vehicle_id: vehicle?.id ?? null,
        name,
        email,
        phone: phone ?? null,
        booking_date: date,
        slot_time: slotTime,
        calendar_event_id: calendarEventId,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Supabase booking insert error:', bookingError);
      return NextResponse.json({ error: 'Failed to save booking.' }, { status: 500 });
    }

    // 3. Notify via HubSpot (non-blocking)
    const [y, m, d] = date.split('-');
    const readableDate = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const [h] = slotTime.split(':').map(Number);
    const readableTime =
      h === 12 ? '12:00 PM' : h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;

    try {
      await createHubSpotEnquiry({
        name,
        email,
        phone,
        message: `Viewing appointment booked: ${readableDate} at ${readableTime}\nVehicle: ${vehicleLabel}`,
        vehicle,
      });
    } catch (err) {
      console.error('HubSpot booking notification failed (non-fatal):', err);
    }

    return NextResponse.json({ success: true, booking });
  } catch (err) {
    console.error('Booking API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
