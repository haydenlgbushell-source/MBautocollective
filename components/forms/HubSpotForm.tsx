'use client';

import { useEffect, useId, useState } from 'react';

export interface HubSpotSubmissionValues {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  message?: string;
  [key: string]: string | undefined;
}

interface HubSpotFormProps {
  formId: string;
  prefill?: Partial<HubSpotSubmissionValues>;
  onSubmitted?: (values: HubSpotSubmissionValues) => void;
}

// Singleton script loader
let scriptState: 'idle' | 'loading' | 'ready' = 'idle';
const queue: (() => void)[] = [];

function loadScript(portalId: string, cb: () => void) {
  if (scriptState === 'ready') { cb(); return; }
  queue.push(cb);
  if (scriptState === 'loading') return;
  scriptState = 'loading';
  const s = document.createElement('script');
  s.src = `https://js-ap1.hsforms.net/forms/embed/${portalId}.js`;
  s.defer = true;
  s.onload = () => { scriptState = 'ready'; queue.splice(0).forEach(f => f()); };
  document.head.appendChild(s);
}

export default function HubSpotForm({ formId, prefill, onSubmitted }: HubSpotFormProps) {
  const uid = useId().replace(/:/g, '');
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? '';
  const [ready, setReady] = useState(false);

  // Load the HubSpot embed script then mark ready
  useEffect(() => {
    if (!formId || !portalId) return;
    loadScript(portalId, () => setReady(true));
  }, [formId, portalId]);

  // Pre-fill fields once the form renders into the DOM
  useEffect(() => {
    if (!ready || !prefill) return;
    const timer = setTimeout(() => {
      const container = document.getElementById(uid);
      if (!container) return;
      Object.entries(prefill).forEach(([name, value]) => {
        if (!value) return;
        const el = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [ready, prefill, uid]);

  // Listen for HubSpot's postMessage submission event
  useEffect(() => {
    if (!onSubmitted) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'hsFormCallback' && e.data?.eventName === 'onFormSubmitted') {
        const values: HubSpotSubmissionValues = {};
        (e.data?.data?.submissionValues ?? []).forEach(
          ({ name, value }: { name: string; value: string }) => { values[name] = value; }
        );
        onSubmitted(values);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSubmitted]);

  if (!formId || !portalId) return null;

  return (
    <div id={uid} className="hubspot-form">
      <div
        className="hs-form-frame"
        data-region="ap1"
        data-form-id={formId}
        data-portal-id={portalId}
      />
    </div>
  );
}
