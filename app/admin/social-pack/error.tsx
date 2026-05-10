'use client';

import { useEffect } from 'react';

export default function SocialPackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[social-pack] page error:', error);
  }, [error]);

  return (
    <div className="px-12 py-12 max-md:px-6">
      <div className="bg-bg-2 border border-red-900/40 p-8 flex flex-col gap-4">
        <div className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-red-400">
          Page Error
        </div>
        <p className="text-[13px] text-text-2">
          {error.message || 'Something went wrong loading this page.'}
        </p>
        {error.digest && (
          <p className="font-mono-custom text-[10px] text-text-3">
            Digest: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="self-start bg-gold text-bg font-body text-[10px] tracking-[0.2em] uppercase px-5 py-[10px] font-[500] hover:bg-gold-hi transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
