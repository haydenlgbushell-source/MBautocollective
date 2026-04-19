'use client';

import { useEffect, useId } from 'react';

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: Record<string, unknown>) => void;
      };
    };
  }
}

// Single script load shared across all form instances
let scriptState: 'idle' | 'loading' | 'ready' = 'idle';
const pendingCallbacks: (() => void)[] = [];

function loadHubSpotScript(onReady: () => void) {
  if (scriptState === 'ready') { onReady(); return; }
  pendingCallbacks.push(onReady);
  if (scriptState === 'loading') return;
  scriptState = 'loading';
  const s = document.createElement('script');
  s.src = '//js-ap1.hsforms.net/forms/embed/v2.js';
  s.charset = 'utf-8';
  s.async = true;
  s.onload = () => {
    scriptState = 'ready';
    pendingCallbacks.splice(0).forEach((fn) => fn());
  };
  document.head.appendChild(s);
}

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

export default function HubSpotForm({ formId, prefill, onSubmitted }: HubSpotFormProps) {
  const uid = useId().replace(/:/g, '');
  const containerId = `hs-form-${uid}`;
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID ?? '';

  useEffect(() => {
    if (!formId || !portalId) return;

    loadHubSpotScript(() => {
      window.hbspt?.forms.create({
        region: 'ap1',
        portalId,
        formId,
        target: `#${containerId}`,
        cssRequired: '',
        css: '',
        onFormReady: (form: HTMLFormElement) => {
          if (!prefill) return;
          Object.entries(prefill).forEach(([name, value]) => {
            if (!value) return;
            const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
              `[name="${name}"]`
            );
            if (el) {
              el.value = value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        },
        onFormSubmitted: (
          _$form: unknown,
          data: { submissionValues?: HubSpotSubmissionValues }
        ) => {
          onSubmitted?.(data?.submissionValues ?? {});
        },
      });
    });
  }, [formId, portalId, containerId, prefill, onSubmitted]);

  return <div id={containerId} className="hubspot-form" />;
}
