'use client';

import { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  variant?: 'icon' | 'text';
}

export default function ShareButton({ url, title, variant = 'icon' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — no action needed
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API not available
      }
    }
  };

  if (variant === 'text') {
    return (
      <button
        onClick={handleShare}
        className="flex items-center gap-2 font-mono-custom text-[9px] tracking-[0.2em] uppercase text-text-3 hover:text-gold transition-colors"
        aria-label={copied ? 'Link copied' : 'Share this vehicle'}
      >
        {copied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[13px] h-[13px]"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clipRule="evenodd"
              />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-[13px] h-[13px]"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                clipRule="evenodd"
              />
            </svg>
            <span>Share</span>
          </>
        )}
      </button>
    );
  }

  // icon variant (for cards)
  return (
    <button
      onClick={handleShare}
      className="w-[30px] h-[30px] flex items-center justify-center bg-[rgba(0,0,0,0.65)] text-text-3 hover:text-gold hover:bg-[rgba(0,0,0,0.85)] transition-all duration-200"
      aria-label={copied ? 'Link copied' : 'Share this vehicle'}
      title={copied ? 'Link copied!' : 'Share'}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[12px] h-[12px]"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[12px] h-[12px]"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
