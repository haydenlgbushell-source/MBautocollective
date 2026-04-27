'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/constants';

const labelCls = 'block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]';
const inputCls =
  'w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3';

export default function CarSourcingForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    make: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    budget: '',
    colour: '',
    transmission: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const yearRange =
        form.yearFrom || form.yearTo
          ? ` Year: ${form.yearFrom || 'any'}–${form.yearTo || 'any'}.`
          : '';
      const extras = [
        form.colour && `Colour: ${form.colour}`,
        form.transmission && `Transmission: ${form.transmission}`,
        form.notes && `Notes: ${form.notes}`,
      ]
        .filter(Boolean)
        .join(' ');

      const message = `Car Sourcing Request: ${form.make} ${form.model}.${yearRange} Budget: ${form.budget}.${extras ? ' ' + extras : ''}`;

      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message,
          source: 'sourcing',
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-10">
        <div className="font-display text-[48px] text-gold mb-3">✓</div>
        <div className="font-display text-[22px] italic text-text-2">
          Sourcing request received.
          <br />
          {BUSINESS.director} will be in touch within 24 hours.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        {/* Contact details */}
        <div className="mb-2">
          <label className={labelCls}>Your Name</label>
          <input
            name="name" value={form.name} onChange={handleChange} required
            className={inputCls} placeholder="Full name"
          />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Phone</label>
          <input
            name="phone" value={form.phone} onChange={handleChange} type="tel"
            className={inputCls} placeholder="04XX XXX XXX"
          />
        </div>
        <div className="mb-2 sm:col-span-2">
          <label className={labelCls}>Email</label>
          <input
            name="email" value={form.email} onChange={handleChange} required type="email"
            className={inputCls} placeholder="your@email.com"
          />
        </div>

        {/* Divider */}
        <div className="sm:col-span-2 border-t border-border my-1" />

        {/* Vehicle details */}
        <div className="mb-2">
          <label className={labelCls}>Make</label>
          <input
            name="make" value={form.make} onChange={handleChange} required
            className={inputCls} placeholder="e.g. Porsche"
          />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Model</label>
          <input
            name="model" value={form.model} onChange={handleChange} required
            className={inputCls} placeholder="e.g. 911 Carrera"
          />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Year From</label>
          <input
            name="yearFrom" value={form.yearFrom} onChange={handleChange}
            className={inputCls} placeholder="e.g. 2020"
          />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Year To</label>
          <input
            name="yearTo" value={form.yearTo} onChange={handleChange}
            className={inputCls} placeholder="e.g. 2024"
          />
        </div>
        <div className="mb-2 sm:col-span-2">
          <label className={labelCls}>Budget</label>
          <input
            name="budget" value={form.budget} onChange={handleChange} required
            className={inputCls} placeholder="e.g. $120,000"
          />
        </div>

        {/* Divider */}
        <div className="sm:col-span-2 border-t border-border my-1" />

        {/* Preferences */}
        <div className="mb-2">
          <label className={labelCls}>Colour Preference</label>
          <input
            name="colour" value={form.colour} onChange={handleChange}
            className={inputCls} placeholder="e.g. Black, Silver, Any"
          />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Transmission</label>
          <select
            name="transmission" value={form.transmission} onChange={handleChange}
            className={inputCls + ' cursor-pointer'}
            style={{ appearance: 'none' }}
          >
            <option value="">Any</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div className="mb-2 sm:col-span-2">
          <label className={labelCls}>Additional Notes</label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange} rows={4}
            className={inputCls + ' resize-none'}
            placeholder="Specific options, features, or anything else we should know…"
          />
        </div>
      </div>

      {error && <p className="text-[12px] text-red-400 mb-4 mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors mt-4 disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Submit Sourcing Request'}
      </button>
    </form>
  );
}
