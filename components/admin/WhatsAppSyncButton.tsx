'use client';

import { useState } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function WhatsAppSyncButton() {
  const [state, setState] = useState<State>('idle');
  const [detail, setDetail] = useState('');

  const handleSync = async () => {
    setState('loading');
    setDetail('');
    try {
      const res = await fetch('/api/whatsapp-catalogue/sync', { method: 'POST' });
      const json = await res.json() as { synced?: number; error?: string };
      if (!res.ok) {
        setState('error');
        setDetail(json.error ?? 'Unknown error');
      } else {
        setState('success');
        setDetail(`${json.synced ?? 0} vehicles synced`);
      }
    } catch {
      setState('error');
      setDetail('Network error');
    }
    setTimeout(() => setState('idle'), 5000);
  };

  const label =
    state === 'loading' ? 'Syncing...' :
    state === 'success' ? `Synced ✓` :
    state === 'error' ? 'Failed' :
    'Sync WhatsApp Catalogue';

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={state === 'loading'}
        className={`inline-flex items-center gap-2 border font-body text-[9px] tracking-[0.2em] uppercase px-5 py-3 transition-all disabled:opacity-50 ${
          state === 'success'
            ? 'border-green-700 text-green-400'
            : state === 'error'
            ? 'border-red-800 text-red-400'
            : 'border-border text-text-3 hover:border-gold-lo hover:text-gold'
        }`}
      >
        <span className="text-[12px]">
          {state === 'loading' ? '↻' : state === 'success' ? '✓' : state === 'error' ? '✕' : '⟳'}
        </span>
        {label}
      </button>
      {detail && (
        <span className={`font-mono-custom text-[9px] tracking-[0.1em] ${state === 'error' ? 'text-red-400' : 'text-text-3'}`}>
          {detail}
        </span>
      )}
    </div>
  );
}
