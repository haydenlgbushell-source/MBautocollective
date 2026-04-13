'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminDeleteButtonProps {
  vehicleId: string;
}

export default function AdminDeleteButton({ vehicleId }: AdminDeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`bg-transparent border px-[14px] py-[6px] font-body text-[9px] tracking-[0.15em] uppercase transition-all disabled:opacity-50 ${
        confirming
          ? 'border-red-800 text-red-400 hover:border-red-600 hover:text-red-300'
          : 'border-border text-text-3 hover:border-red-800 hover:text-red-400'
      }`}
      onBlur={() => setConfirming(false)}
    >
      {loading ? '...' : confirming ? 'Confirm?' : 'Delete'}
    </button>
  );
}
