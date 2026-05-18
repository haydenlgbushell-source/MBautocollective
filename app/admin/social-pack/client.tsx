'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/types/vehicle';
import type { SocialPack, IGVariant, PublishPlatform, PublishResults } from '@/types/social';
import { formatPrice, formatKm } from '@/lib/utils';
import SocialPackCard from '@/components/admin/SocialPackCard';
import { approvePack, updatePack, updateVehiclePhotos, publishPack } from './actions';
import type { PackEdits } from './actions';

export default function SocialPackClientPage({
  vehicles,
  packsMap,
  linkedInConnected,
  linkedInError,
  linkedInJustConnected,
}: {
  vehicles: Vehicle[];
  packsMap: Record<string, SocialPack>;
  linkedInConnected: boolean;
  linkedInError?: string | null;
  linkedInJustConnected?: boolean;
}) {
  const [selected, setSelected] = useState<Vehicle | null>(vehicles[0] ?? null);
  const [isApprovePending, startApproveTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  const pack = selected ? (packsMap[selected.id] ?? null) : null;
  const isPending = isApprovePending || isGenerating;

  function handleApprove(packId: string, variant: IGVariant) {
    setActionError(null);
    startApproveTransition(async () => {
      const result = await approvePack(packId, variant);
      if (result?.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleRegenerate(vehicleId: string) {
    setActionError(null);
    setIsGenerating(true);
    fetch('/api/social-pack/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.error) {
          setActionError(data.detail ?? data.error ?? 'Generation failed');
        } else {
          router.refresh();
        }
      })
      .catch((err) => setActionError(err.message ?? 'Network error'))
      .finally(() => setIsGenerating(false));
  }

  async function handleSave(packId: string, edits: PackEdits) {
    setActionError(null);
    const result = await updatePack(packId, edits);
    if (result?.error) {
      setActionError(result.error);
      throw new Error(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleVehiclePhotosChange(vehicleId: string, photos: string[]) {
    setActionError(null);
    const result = await updateVehiclePhotos(vehicleId, photos);
    if (result?.error) setActionError(result.error);
    else router.refresh();
  }

  async function handlePublish(packId: string, platforms: PublishPlatform[]): Promise<PublishResults> {
    setActionError(null);
    const result = await publishPack(packId, platforms);
    if (result.error) setActionError(result.error);
    else router.refresh();
    return result.results;
  }

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <h1 className="font-display text-[36px] font-[300]">
          Social <em className="italic text-gold-hi">Pack</em>
        </h1>
        <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3">
          Platform-ready content for every vehicle
        </div>
      </div>

      {/* LinkedIn OAuth error banner */}
      {linkedInError && (
        <div className="mb-6 border border-red-900/40 bg-red-950/20 px-5 py-4 flex items-start gap-3">
          <span className="flex-shrink-0 text-red-400">⚠</span>
          <span className="font-body text-[11px] text-red-400">LinkedIn connection failed: {linkedInError}</span>
        </div>
      )}

      {/* LinkedIn just connected banner */}
      {linkedInJustConnected && (
        <div className="mb-6 border border-green-900/40 bg-green-950/20 px-5 py-4">
          <span className="font-body text-[11px] text-green-400">LinkedIn connected successfully.</span>
        </div>
      )}

      {/* LinkedIn connection banner */}
      {!linkedInConnected && !linkedInJustConnected && (
        <div className="mb-6 border border-[#b8963e]/30 bg-[#b8963e]/5 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <span className="font-body text-[11px] text-[#b8963e]">
            LinkedIn not connected — publishing to LinkedIn will fail.
          </span>
          <a
            href="/api/linkedin/auth"
            className="border border-[#b8963e] text-[#b8963e] font-body text-[10px] tracking-[0.18em] uppercase px-4 py-2 hover:bg-[#b8963e]/10 transition-colors flex-shrink-0"
          >
            Connect LinkedIn
          </a>
        </div>
      )}


      {/* Action error */}
      {actionError && (
        <div className="mb-6 border border-red-900/40 bg-red-950/20 px-4 py-3 text-[12px] text-red-400 font-body flex items-start gap-3">
          <span className="flex-shrink-0">⚠</span>
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-red-600 hover:text-red-400 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Vehicle selector */}
      <div className="mb-8">
        <div className="font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 mb-3">
          Select Vehicle
        </div>
        {vehicles.length === 0 ? (
          <div className="bg-bg-2 border border-border px-4 py-5 text-text-3 text-[12px] text-center">
            No vehicles found. Add a vehicle to generate social content.
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {vehicles.map((v) => {
              const label = `${v.year} ${v.make} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
              const isActive = selected?.id === v.id;
              const hasPack = !!packsMap[v.id];
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`flex flex-col text-left px-4 py-3 border transition-all ${
                    isActive
                      ? 'border-gold bg-gold-dim text-text'
                      : 'border-border text-text-2 hover:border-gold-lo hover:text-text'
                  }`}
                >
                  <span className="font-body text-[10px] tracking-[0.12em] uppercase">{label}</span>
                  <span
                    className={`font-mono-custom text-[9px] mt-[2px] ${isActive ? 'text-gold' : 'text-text-3'}`}
                  >
                    {formatPrice(v.price)}
                    {v.kilometres ? ` · ${formatKm(v.kilometres)}` : ''}
                    {!hasPack && (
                      <span className="text-text-3 opacity-60"> · no pack</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Social pack card */}
      {selected && (
        <div className="bg-bg-2 border border-border p-8 max-md:p-5">
          <div className="flex items-baseline gap-3 mb-8 flex-wrap">
            <h2 className="font-display text-[28px] font-[300]">
              {selected.year} {selected.make}{' '}
              <em className="italic text-gold-hi">{selected.model}</em>
              {selected.variant ? ` ${selected.variant}` : ''}
            </h2>
            <span className="font-mono-custom text-[10px] tracking-[0.2em] text-text-3 uppercase">
              {formatPrice(selected.price)}
              {selected.kilometres ? ` · ${formatKm(selected.kilometres)}` : ''}
            </span>
          </div>
          <SocialPackCard
            key={selected.id}
            vehicle={selected}
            pack={pack}
            isPending={isPending}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
            onSave={handleSave}
            onVehiclePhotosChange={handleVehiclePhotosChange}
            onPublish={handlePublish}
          />
        </div>
      )}
    </div>
  );
}
