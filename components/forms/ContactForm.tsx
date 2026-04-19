'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/constants';
import HubSpotForm from './HubSpotForm';

const FORM_ID = process.env.NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID ?? '';

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center py-10">
        <div className="font-display text-[48px] text-gold mb-3">✓</div>
        <div className="font-display text-[22px] italic text-text-2">
          Message sent.
          <br />
          {BUSINESS.director} will be in touch shortly.
        </div>
      </div>
    );
  }

  return <HubSpotForm formId={FORM_ID} onSubmitted={() => setSent(true)} />;
}
