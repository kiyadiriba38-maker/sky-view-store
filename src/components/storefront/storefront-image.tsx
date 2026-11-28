"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/** Keeps product cards and galleries visually complete when a remote image fails. */
export default function StorefrontImage({
  src,
  fallbackSrc,
  alt,
  sizes = "100vw",
  className = "",
  priority = false,
}: Props) {
  const primary = typeof src === "string" ? src.trim() : "";
  const fallback = typeof fallbackSrc === "string" ? fallbackSrc.trim() : "";
  const [usingFallback, setUsingFallback] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    setUsingFallback(false);
    setUnavailable(false);
  }, [primary, fallback]);

  const activeSource = usingFallback || !primary ? fallback : primary;
  if (!activeSource || unavailable) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,rgba(190,128,53,.24),transparent_58%),linear-gradient(145deg,#292016,#15120f_72%)] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-amber-100/45">
          <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12">
            <path d="M8 45 25 17l10 16 6-9 15 21H8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M15 51h34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] font-bold tracking-[.22em]">SKY VIEW</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={activeSource}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => {
        if (!usingFallback && fallback && fallback !== primary) {
          setUsingFallback(true);
        } else {
          setUnavailable(true);
        }
      }}
    />
  );
}
