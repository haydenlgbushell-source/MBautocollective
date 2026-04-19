'use client';

import { useState } from 'react';
import { BUSINESS } from '@/lib/constants';
import HubSpotForm, { type HubSpotSubmissionValues } from './HubSpotForm';
import type { Vehicle } from '@/types/vehicle';

const FORM_ID = process.env.NEXT_PUBLIC_HUBSPOT_ENQUIRY_FORM_ID ?? '';

interface EnquiryFormProps {
  vehicle: Vehicle;
  compact?: boolean;
}

export default function EnquiryForm({ vehicle }: EnquiryFormProps) {
  const [sent, setSent] = useState(false);

  const prefill = {
    message: `Hi ${BUSINESS.director}, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
  };

  const handleSubmitted = (values: HubSpotSubmissionValues) => {
    // Create a CRM deal linked to the submitted contact — best-effort, non-blocking
    fetch('/api/deal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        name: `${values.firstname ?? ''} ${values.lastname ?? ''}`.trim(),
        message: values.message,
        vehicle: {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
        },
      }),
    }).catch(() => {});
    setSent(true);
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

  return <HubSpotForm formId={FORM_ID} prefill={prefill} onSubmitted={handleSubmitted} />;
}
