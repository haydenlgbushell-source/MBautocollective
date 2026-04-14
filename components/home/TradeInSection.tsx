'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

const inputCls =
  'w-full bg-transparent border text-text font-body text-[13px] font-[300] px-4 py-[14px] outline-none transition-colors placeholder:text-text-3';

const inputStyle = { borderColor: 'rgba(245,242,237,0.1)', background: 'rgba(255,255,255,0.04)' };
const inputFocusStyle = { borderColor: '#b8963e' };

function FormInput({
  label, name, value, onChange, placeholder, type = 'text',
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block font-mono-custom text-[9px] tracking-[0.2em] uppercase mb-2"
        style={{ color: 'rgba(245,242,237,0.35)' }}>
        {label}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
        style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

export default function TradeInSection() {
  const [form, setForm] = useState({ rego: '', make: '', year: '', km: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const message = `Instant Valuation: ${form.year} ${form.make}, ${form.km} km. Rego: ${form.rego}. Phone: ${form.phone}`;
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Valuation Request',
          phone: form.phone,
          message,
          source: 'homepage-tradein',
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

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 px-[60px] py-[100px] gap-[80px] max-md:px-6 max-md:py-16 max-md:gap-12"
      style={{ background: '#1c1c1e' }}
      id="tradein"
    >
      {/* Left — content */}
      <div>
        <div className="flex items-center gap-[16px] mb-9">
          <span className="font-mono-custom text-[10px] tracking-[0.3em] uppercase text-gold">
            Sell or Trade
          </span>
          <div className="h-px w-[80px]" style={{ background: 'rgba(184,150,62,0.3)' }} />
        </div>

        <h2
          className="font-display font-[300] leading-[1.1] mb-5"
          style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}
        >
          Your Car,
          <br />
          <em className="italic text-gold-hi">Valued Honestly.</em>
        </h2>

        <p
          className="font-body text-[13px] text-text-2 leading-[1.9] mb-9 max-w-[400px]"
          style={{ letterSpacing: '0.03em' }}
        >
          We offer genuine market valuations for trade-ins and outright purchases. No lowball
          offers, no wasted time. Tell us about your vehicle and {BUSINESS.director} will come
          back to you within the hour.
        </p>

        <ol className="list-none flex flex-col gap-[16px] mb-10">
          {[
            "Enter your vehicle's registration and a few quick details",
            "We assess against live market data and our current demand",
            "Receive a genuine offer — apply to purchase, or cash out",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-5">
              <span
                className="font-display text-[28px] font-[300] text-gold leading-none min-w-[28px]"
                style={{ opacity: 0.5 }}
              >
                0{i + 1}
              </span>
              <span className="font-body text-[12px] text-text-2 leading-[1.7] pt-[6px]"
                style={{ letterSpacing: '0.05em' }}>
                {step}
              </span>
            </li>
          ))}
        </ol>

        <Link
          href="/car-valuation"
          className="inline-flex items-center bg-gold text-bg font-body text-[10px] font-[600] tracking-[0.25em] uppercase px-9 py-[16px] hover:bg-gold-hi transition-colors no-underline"
        >
          Start Your Valuation
        </Link>
      </div>

      {/* Right — inline form panel */}
      <div
        className="p-[44px] max-md:p-7"
        style={{ background: '#0a0a0a', border: '1px solid rgba(184,150,62,0.25)' }}
      >
        {sent ? (
          <div className="text-center py-12">
            <div className="font-display text-[56px] text-gold mb-4 leading-none">✓</div>
            <div className="font-display text-[22px] italic text-text-2 leading-[1.5]">
              Request received.<br />
              {BUSINESS.director} will be in touch within the hour.
            </div>
          </div>
        ) : (
          <>
            <div className="font-display text-[26px] font-[300] mb-[6px]">Instant Valuation</div>
            <div className="font-mono-custom text-[9px] tracking-[0.15em] uppercase text-text-3 mb-8">
              Takes less than 2 minutes
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormInput
                label="Rego Number"
                name="rego"
                value={form.rego}
                onChange={handleChange}
                placeholder="e.g. ABC123 (NSW)"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Make"
                  name="make"
                  value={form.make}
                  onChange={handleChange}
                  placeholder="e.g. BMW"
                />
                <FormInput
                  label="Year"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="e.g. 2021"
                />
              </div>

              <FormInput
                label="Approximate Kilometres"
                name="km"
                value={form.km}
                onChange={handleChange}
                placeholder="e.g. 25,000 km"
              />

              <FormInput
                label="Your Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="We'll call you within the hour"
                type="tel"
              />

              {error && (
                <p className="text-[12px] text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-gold text-bg font-body text-[10px] font-[600] tracking-[0.25em] uppercase py-[16px] hover:bg-gold-hi transition-colors mt-2 disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Get My Valuation →'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
