'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/constants';

const labelCls = 'block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]';
const inputCls =
  'w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3';

export default function ValuationForm() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', make: '', model: '', year: '', kilometres: '', notes: '',
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
      const message = `Valuation request: ${form.year} ${form.make} ${form.model}, ${form.kilometres} km.${form.notes ? ' ' + form.notes : ''}`;
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone, message, source: 'valuation',
          details: {
            make: form.make, model: form.model, year: form.year,
            kilometres: form.kilometres, notes: form.notes,
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
          Valuation request received.
          <br />
          {BUSINESS.director} will be in touch within 24 hours.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
        <div className="mb-2">
          <label className={labelCls}>Your Name</label>
          <input name="name" value={form.name} onChange={handleChange} required
            className={inputCls} placeholder="Full name" />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange}
            className={inputCls} placeholder="04XX XXX XXX" />
        </div>
        <div className="mb-2 sm:col-span-2">
          <label className={labelCls}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            className={inputCls} placeholder="your@email.com" />
        </div>
        <div className="sm:col-span-2 border-t border-border my-1" />
        <div className="mb-2">
          <label className={labelCls}>Make</label>
          <input name="make" value={form.make} onChange={handleChange} required
            className={inputCls} placeholder="e.g. BMW" />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Model</label>
          <input name="model" value={form.model} onChange={handleChange} required
            className={inputCls} placeholder="e.g. M3" />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Year</label>
          <input name="year" value={form.year} onChange={handleChange}
            className={inputCls} placeholder="e.g. 2021" />
        </div>
        <div className="mb-2">
          <label className={labelCls}>Kilometres</label>
          <input name="kilometres" value={form.kilometres} onChange={handleChange}
            className={inputCls} placeholder="e.g. 45,000" />
        </div>
        <div className="mb-2 sm:col-span-2">
          <label className={labelCls}>Additional Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className={inputCls + ' resize-none'}
            placeholder="Condition, service history, modifications…" />
        </div>
      </div>

      {error && <p className="text-[12px] text-red-400 mb-4 mt-2">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-9 py-[14px] font-[500] hover:bg-gold-hi transition-colors mt-4 disabled:opacity-60">
        {loading ? 'Sending...' : 'Request Free Valuation'}
      </button>
    </form>
  );
}
