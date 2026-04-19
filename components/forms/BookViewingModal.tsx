'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Vehicle } from '@/types/vehicle';

interface BookViewingModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

interface TimeSlot {
  time: string;
  label: string;
}

// Generate the next 14 selectable days (Mon–Sat only)
function getSelectableDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  while (dates.length < 14) {
    const day = cursor.getDay(); // 0=Sun
    if (day !== 0) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type Step = 'datetime' | 'details' | 'confirmed';

export default function BookViewingModal({ vehicle, onClose }: BookViewingModalProps) {
  const [step, setStep] = useState<Step>('datetime');
  const [selectableDates] = useState<Date[]>(getSelectableDates);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Fetch available slots when date changes
  const fetchSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    setSlotsError('');
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/booking/slots?date=${formatDateParam(date)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch availability');
      setSlots(data.slots ?? []);
    } catch {
      setSlotsError('Could not load availability. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedSlot) return;
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: formatDateParam(selectedDate),
          slotTime: selectedSlot.time,
          vehicle: {
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            variant: vehicle.variant,
            year: vehicle.year,
            price: vehicle.price,
            slug: vehicle.slug,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create booking');
      setStep('confirmed');
    } catch (err) {
      setSubmitError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const vehicleLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Book a viewing"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-lg bg-bg border border-border overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <div>
            <div className="font-mono-custom text-[8px] tracking-[0.3em] uppercase text-gold mb-[3px]">
              MB Auto Collective
            </div>
            <div className="font-display text-[22px] font-[300]">Book a Viewing</div>
          </div>
          <button
            onClick={onClose}
            className="text-text-3 hover:text-text transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Vehicle label */}
        <div className="px-8 py-3 bg-bg-2 border-b border-border">
          <span className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3">
            {vehicleLabel}
          </span>
        </div>

        {/* ── Step 1: Date + Time ── */}
        {step === 'datetime' && (
          <div className="px-8 py-7">
            <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-4">
              Select a date
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-4 gap-2 mb-7">
              {selectableDates.map((d, i) => {
                const isSelected = selectedDate && formatDateParam(d) === formatDateParam(selectedDate);
                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(d)}
                    className={`text-center px-2 py-[10px] border transition-all ${
                      isSelected
                        ? 'border-gold bg-gold text-bg'
                        : 'border-border text-text-2 hover:border-gold-lo hover:text-text'
                    }`}
                  >
                    <div className="font-mono-custom text-[7px] tracking-[0.18em] uppercase mb-[3px]">
                      {d.toLocaleDateString('en-AU', { weekday: 'short' })}
                    </div>
                    <div className="font-body text-[13px] font-[500]">
                      {d.getDate()}
                    </div>
                    <div className="font-mono-custom text-[7px] tracking-[0.1em] uppercase opacity-70">
                      {d.toLocaleDateString('en-AU', { month: 'short' })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <>
                <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-3">
                  Available times — {formatDateDisplay(selectedDate)}
                </div>

                {slotsLoading && (
                  <div className="flex gap-2 mb-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 flex-1 bg-bg-3 border border-border animate-pulse" />
                    ))}
                  </div>
                )}

                {!slotsLoading && slotsError && (
                  <p className="text-[12px] text-red-400 mb-6">{slotsError}</p>
                )}

                {!slotsLoading && !slotsError && slots.length === 0 && (
                  <p className="text-[12px] text-text-3 mb-6">
                    No availability on this day. Please select another date.
                  </p>
                )}

                {!slotsLoading && !slotsError && slots.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.time === slot.time;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-[10px] text-center border font-body text-[11px] tracking-[0.08em] transition-all ${
                            isSelected
                              ? 'border-gold bg-gold text-bg'
                              : 'border-border text-text-2 hover:border-gold-lo hover:text-text'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            <button
              onClick={handleNext}
              disabled={!selectedDate || !selectedSlot}
              className="w-full bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── Step 2: Contact Details ── */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} className="px-8 py-7">
            {/* Selected slot summary */}
            {selectedDate && selectedSlot && (
              <div className="flex items-center justify-between bg-bg-2 border border-border px-4 py-3 mb-6">
                <div>
                  <div className="font-mono-custom text-[8px] tracking-[0.22em] uppercase text-text-3 mb-[2px]">
                    Your appointment
                  </div>
                  <div className="font-body text-[13px] text-text">
                    {formatDateFull(selectedDate)} at {selectedSlot.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep('datetime'); setSelectedSlot(null); }}
                  className="font-mono-custom text-[8px] tracking-[0.18em] uppercase text-gold hover:text-gold-hi transition-colors"
                >
                  Change
                </button>
              </div>
            )}

            <div className="mb-4">
              <label className="block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3"
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label className="block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-6">
              <label className="block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3"
                placeholder="04XX XXX XXX"
              />
            </div>

            {submitError && (
              <p className="text-[12px] text-red-400 mb-4">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Booking...' : 'Confirm Viewing'}
            </button>

            <p className="text-[11px] text-text-3 text-center mt-3 leading-[1.6]">
              A calendar invite will be sent to your email.
            </p>
          </form>
        )}

        {/* ── Confirmed ── */}
        {step === 'confirmed' && (
          <div className="px-8 py-12 text-center">
            <div className="font-display text-[52px] text-gold mb-4 leading-none">✓</div>
            <div className="font-display text-[22px] font-[300] mb-2">Viewing Confirmed</div>
            <p className="text-[13px] text-text-2 leading-[1.8] mb-1">
              {selectedDate && selectedSlot && (
                <>{formatDateFull(selectedDate)} at {selectedSlot.label}</>
              )}
            </p>
            <p className="text-[13px] text-text-3 leading-[1.8] mb-8">
              1/267 Young Street, Waterloo NSW 2017
            </p>
            <p className="text-[12px] text-text-3 mb-8">
              A calendar invite has been sent to <span className="text-text">{form.email}</span>.
              <br />
              Matt will be in touch to confirm.
            </p>
            <button
              onClick={onClose}
              className="bg-bg-3 border border-border text-text-2 font-body text-[11px] tracking-[0.2em] uppercase px-8 py-[13px] font-[500] hover:border-gold hover:text-gold transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
