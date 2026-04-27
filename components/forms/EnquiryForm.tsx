'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/constants';
import type { Vehicle } from '@/types/vehicle';

const labelCls = 'block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]';
const inputCls =
  'w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3';

interface EnquiryFormProps {
  vehicle: Vehicle;
  compact?: boolean;
}

export default function EnquiryForm({ vehicle, compact = false }: EnquiryFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi ${BUSINESS.director}, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'enquiry',
          vehicle: {
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            slug: vehicle.slug,
          },
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
          Enquiry sent.
          <br />
          {BUSINESS.director} will be in touch soon.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className={labelCls}>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required
          className={inputCls} placeholder="Your name" />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required
          className={inputCls} placeholder="your@email.com" />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange}
          className={inputCls} placeholder="04XX XXX XXX" />
      </div>
      <div className="mb-4">
        <label className={labelCls}>Message</label>
        <textarea name="message" value={form.message} onChange={handleChange}
          rows={compact ? 3 : 4}
          className={inputCls + ' resize-vertical min-h-[80px]'} />
      </div>

      {error && <p className="text-[12px] text-red-400 mb-4">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? 'Sending...' : 'Send Enquiry'}
      </button>
    </form>
  );
}
