'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUploader from './PhotoUploader';
import { BODY_TYPES, TRANSMISSIONS, FUEL_TYPES, STATUSES } from '@/lib/constants';
import type { Vehicle, VehicleInsert } from '@/types/vehicle';

interface VehicleFormProps {
  vehicle?: Vehicle;
  mode: 'create' | 'edit';
}

export default function VehicleForm({ vehicle, mode }: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<VehicleInsert>>({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    variant: vehicle?.variant ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    price: vehicle?.price ?? 0,
    kilometres: vehicle?.kilometres ?? undefined,
    colour: vehicle?.colour ?? '',
    transmission: vehicle?.transmission ?? 'Automatic',
    body_type: vehicle?.body_type ?? undefined,
    engine: vehicle?.engine ?? '',
    fuel_type: vehicle?.fuel_type ?? 'Petrol',
    seats: vehicle?.seats ?? undefined,
    description: vehicle?.description ?? '',
    features: vehicle?.features ?? [],
    photos: vehicle?.photos ?? [],
    status: vehicle?.status ?? 'available',
    featured: vehicle?.featured ?? false,
  });

  const [featureInput, setFeatureInput] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleToggle = (name: string) => {
    setForm((f) => ({ ...f, [name]: !f[name as keyof typeof f] }));
  };

  const addFeature = () => {
    const feat = featureInput.trim();
    if (feat && !form.features?.includes(feat)) {
      setForm((f) => ({ ...f, features: [...(f.features ?? []), feat] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (feat: string) => {
    setForm((f) => ({ ...f, features: f.features?.filter((x) => x !== feat) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'create' ? '/api/vehicles' : `/api/vehicles/${vehicle!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to save vehicle');
      }

      router.push('/admin/inventory');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-[860px]">
      {/* Core Details */}
      <FormSection title="Core Details">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Make *">
            <input
              name="make"
              value={form.make}
              onChange={handleChange}
              required
              placeholder="e.g. BMW"
              className={inputCls}
            />
          </FormField>
          <FormField label="Model *">
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              required
              placeholder="e.g. M3"
              className={inputCls}
            />
          </FormField>
          <FormField label="Variant" className="col-span-2">
            <input
              name="variant"
              value={form.variant ?? ''}
              onChange={handleChange}
              placeholder="e.g. Competition xDrive"
              className={inputCls}
            />
          </FormField>
          <FormField label="Year *">
            <input
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              required
              min={1900}
              max={new Date().getFullYear() + 1}
              className={inputCls}
            />
          </FormField>
          <FormField label="Price (AUD) *">
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min={0}
              placeholder="e.g. 89500"
              className={inputCls}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Vehicle Specifications */}
      <FormSection title="Specifications">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Kilometres">
            <input
              name="kilometres"
              type="number"
              value={form.kilometres ?? ''}
              onChange={handleChange}
              min={0}
              placeholder="e.g. 45000"
              className={inputCls}
            />
          </FormField>
          <FormField label="Colour">
            <input
              name="colour"
              value={form.colour ?? ''}
              onChange={handleChange}
              placeholder="e.g. Isle of Man Green"
              className={inputCls}
            />
          </FormField>
          <FormField label="Seats">
            <input
              name="seats"
              type="number"
              value={form.seats ?? ''}
              onChange={handleChange}
              min={1}
              max={12}
              className={inputCls}
            />
          </FormField>
          <FormField label="Transmission">
            <select name="transmission" value={form.transmission} onChange={handleChange} className={selectCls}>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Body Type">
            <select name="body_type" value={form.body_type ?? ''} onChange={handleChange} className={selectCls}>
              <option value="">Select...</option>
              {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </FormField>
          <FormField label="Fuel Type">
            <select name="fuel_type" value={form.fuel_type} onChange={handleChange} className={selectCls}>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Engine" className="col-span-3">
            <input
              name="engine"
              value={form.engine ?? ''}
              onChange={handleChange}
              placeholder="e.g. 3.0L Inline-6 TwinPower"
              className={inputCls}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Description */}
      <FormSection title="Description">
        <textarea
          name="description"
          value={form.description ?? ''}
          onChange={handleChange}
          rows={5}
          placeholder="Detailed description of the vehicle..."
          className={`${inputCls} resize-vertical`}
        />
      </FormSection>

      {/* Features */}
      <FormSection title="Features">
        <div className="flex gap-2 mb-3">
          <input
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
            placeholder="e.g. Sunroof"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-5 bg-bg-3 border border-border text-text-2 font-body text-[10px] tracking-[0.15em] uppercase hover:border-gold-lo hover:text-gold transition-all"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.features?.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-2 font-mono-custom text-[9px] tracking-[0.15em] uppercase px-3 py-[6px] border border-border text-text-2"
            >
              {f}
              <button
                type="button"
                onClick={() => removeFeature(f)}
                className="text-text-3 hover:text-red-400 transition-colors text-[10px]"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </FormSection>

      {/* Photos */}
      <FormSection title="Photos">
        <PhotoUploader
          vehicleId={vehicle?.id}
          value={form.photos ?? []}
          onChange={(urls) => setForm((f) => ({ ...f, photos: urls }))}
        />
      </FormSection>

      {/* Listing Settings */}
      <FormSection title="Listing Settings">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Status">
            <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <ToggleRow
          label="Featured on Homepage"
          subLabel="Show this vehicle in the homepage featured section"
          checked={form.featured ?? false}
          onChange={() => handleToggle('featured')}
        />
      </FormSection>

      {error && (
        <div className="mb-4 p-4 bg-[rgba(255,0,0,0.08)] border border-red-900 text-red-400 text-[13px]">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-bg font-body text-[11px] tracking-[0.22em] uppercase px-10 py-[14px] font-[500] hover:bg-gold-hi transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Publish Vehicle' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-transparent text-text-2 font-body text-[11px] tracking-[0.22em] uppercase px-10 py-[14px] font-[300] border border-border-2 hover:border-gold-lo hover:text-gold transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Helper sub-components ──

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-gold mb-5 pb-3 border-b border-border">
        {title}
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-[7px]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  subLabel,
  checked,
  onChange,
}: {
  label: string;
  subLabel?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <div>
        <div className="text-[13px] text-text-2">{label}</div>
        {subLabel && <div className="text-[11px] text-text-3 mt-[3px]">{subLabel}</div>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 border rounded-full relative transition-all duration-200 ${
          checked ? 'bg-gold-lo border-gold-lo' : 'bg-bg-3 border-border'
        }`}
      >
        <span
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full transition-all duration-200 ${
            checked ? 'left-[22px] bg-gold' : 'left-[2px] bg-text-3'
          }`}
        />
      </button>
    </div>
  );
}

const inputCls =
  'w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors placeholder:text-text-3 font-[300]';

const selectCls =
  'w-full bg-bg-2 border border-border px-[14px] py-3 text-text font-body text-[13px] outline-none focus:border-gold-lo transition-colors cursor-pointer appearance-none font-[300]';
