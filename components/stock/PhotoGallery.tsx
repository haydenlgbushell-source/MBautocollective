'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import CarSVG from '@/components/ui/CarSVG';

interface PhotoGalleryProps {
  photos: string[];
  make: string;
  model: string;
  year: number;
}

export default function PhotoGallery({ photos, make, model, year }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const altText = `${year} ${make} ${model}`;

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[16/8] bg-bg-3 flex items-center justify-center">
        <CarSVG width={480} opacity={0.1} />
      </div>
    );
  }

  return (
    <>
      {/* Hero image */}
      <div
        className="aspect-[16/8] bg-bg-3 relative overflow-hidden cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={photos[activeIndex]}
              alt={`${altText} — photo ${activeIndex + 1}`}
              fill
              className="object-cover"
              priority={activeIndex === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0)] group-hover:bg-[rgba(0,0,0,0.18)] transition-colors duration-300 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono-custom text-[9px] tracking-[0.3em] uppercase text-white bg-[rgba(0,0,0,0.7)] px-5 py-[10px]">
            View Gallery
          </div>
        </div>

        {/* Photo counter */}
        <div className="absolute bottom-4 right-4 font-mono-custom text-[8px] tracking-[0.18em] uppercase px-[8px] py-[4px] bg-[rgba(0,0,0,0.65)] text-text-3 pointer-events-none">
          {activeIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-[2px] bg-border overflow-x-auto border-b border-border scrollbar-hide">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 relative w-[120px] h-[80px] overflow-hidden transition-opacity duration-200 ${
                i === activeIndex ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
            >
              <Image
                src={photo}
                alt={`${altText} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {i === activeIndex && (
                <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gold" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(4,4,3,0.97)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-6 font-mono-custom text-[9px] tracking-[0.25em] uppercase text-text-3 hover:text-gold transition-colors z-10"
            >
              Close ✕
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 font-mono-custom text-[9px] tracking-[0.28em] uppercase text-text-3 z-10">
              {activeIndex + 1} / {photos.length}
            </div>

            {/* Prev */}
            {photos.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 border border-[rgba(255,255,255,0.12)] text-text-2 hover:border-gold hover:text-gold transition-all flex items-center justify-center z-10 text-lg"
              >
                ←
              </button>
            )}

            {/* Main lightbox image */}
            <div className="max-w-[88vw] max-h-[80vh] relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                >
                  <Image
                    src={photos[activeIndex]}
                    alt={`${altText} — photo ${activeIndex + 1}`}
                    width={1400}
                    height={900}
                    className="object-contain"
                    style={{ maxHeight: '80vh', width: 'auto', maxWidth: '88vw' }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next */}
            {photos.length > 1 && (
              <button
                onClick={next}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 border border-[rgba(255,255,255,0.12)] text-text-2 hover:border-gold hover:text-gold transition-all flex items-center justify-center z-10 text-lg"
              >
                →
              </button>
            )}

            {/* Bottom thumbnail strip */}
            {photos.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-[4px] z-10">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-[56px] h-[38px] overflow-hidden transition-all duration-200 ${
                      i === activeIndex
                        ? 'opacity-100 ring-1 ring-gold'
                        : 'opacity-35 hover:opacity-65'
                    }`}
                  >
                    <Image
                      src={photo}
                      alt={`thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
