'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface PhotoUploaderProps {
  vehicleId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

interface UploadItem {
  id: string;
  url: string;
  uploading?: boolean;
  error?: string;
}

export default function PhotoUploader({ vehicleId, value, onChange }: PhotoUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>(
    value.map((url) => ({ id: url, url }))
  );
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', file);
      if (vehicleId) formData.append('vehicleId', vehicleId);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url as string;
      } catch {
        return null;
      }
    },
    [vehicleId]
  );

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
    );

    const placeholders: UploadItem[] = fileArray.map((f) => ({
      id: `uploading-${Date.now()}-${f.name}`,
      url: URL.createObjectURL(f),
      uploading: true,
    }));

    setItems((prev) => {
      const next = [...prev, ...placeholders];
      return next;
    });

    for (let i = 0; i < fileArray.length; i++) {
      const placeholder = placeholders[i];
      const url = await uploadFile(fileArray[i]);

      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === placeholder.id) {
            if (url) {
              return { id: url, url, uploading: false };
            } else {
              return { ...item, uploading: false, error: 'Failed' };
            }
          }
          return item;
        });
        const uploaded = next.filter((i) => !i.uploading && !i.error).map((i) => i.url);
        onChange(uploaded);
        return next;
      });
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      onChange(next.filter((i) => !i.uploading && !i.error).map((i) => i.url));
      return next;
    });
  };

  const moveItem = (from: number, to: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next.filter((i) => !i.uploading && !i.error).map((i) => i.url));
      return next;
    });
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`border border-dashed px-12 py-12 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-gold-lo bg-[rgba(201,168,76,0.08)]'
            : 'border-border-2 hover:border-gold-lo hover:bg-[rgba(201,168,76,0.04)]'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="text-[28px] mb-3 opacity-25">📷</div>
        <div className="text-[12px] text-text-2 tracking-[0.04em]">
          Drag &amp; drop photos here, or click to browse
        </div>
        <div className="text-[11px] text-text-3 mt-[6px]">
          JPG, PNG or WebP · Multiple files accepted · First photo = cover image
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-4">
          {items.map((item, idx) => (
            <div key={item.id} className="relative group aspect-[4/3] bg-bg-3 overflow-hidden">
              <Image
                src={item.url}
                alt={`Photo ${idx + 1}`}
                fill
                className={`object-cover ${item.uploading ? 'opacity-50' : ''}`}
                sizes="25vw"
              />

              {item.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
                  <div className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-gold">
                    Uploading...
                  </div>
                </div>
              )}

              {item.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)]">
                  <div className="font-mono-custom text-[9px] text-red-400">{item.error}</div>
                </div>
              )}

              {idx === 0 && !item.uploading && !item.error && (
                <div className="absolute top-1 left-1 font-mono-custom text-[7px] tracking-[0.15em] uppercase px-[6px] py-[3px] bg-[rgba(0,0,0,0.7)] text-gold border border-gold-lo">
                  Cover
                </div>
              )}

              {/* Controls */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveItem(idx, idx - 1)}
                    className="w-6 h-6 bg-[rgba(0,0,0,0.8)] text-text-2 hover:text-gold flex items-center justify-center text-[10px]"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                {idx < items.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveItem(idx, idx + 1)}
                    className="w-6 h-6 bg-[rgba(0,0,0,0.8)] text-text-2 hover:text-gold flex items-center justify-center text-[10px]"
                    title="Move right"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="w-6 h-6 bg-[rgba(0,0,0,0.8)] text-text-2 hover:text-red-400 flex items-center justify-center text-[10px]"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
