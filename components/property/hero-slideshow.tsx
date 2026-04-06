"use client";

import { useState, useEffect } from "react";

type HeroImage = {
  id: string;
  url: string;
  altText: string | null;
};

type Props = {
  images: HeroImage[];
  interval?: number;
  children?: React.ReactNode;
};

export function HeroSlideshow({ images, interval = 5000, children }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) return null;

  return (
    <div className="hero-fullwidth">
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.url}
          alt={img.altText ?? ""}
          className={`hero-fullwidth-slide ${i === current ? "hero-fullwidth-slide-active" : ""}`}
        />
      ))}
      <div className="hero-fullwidth-overlay" />
      <div className="hero-fullwidth-content container">
        {children}
      </div>
      {images.length > 1 && (
        <div className="hero-dots">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className={`hero-dot ${i === current ? "hero-dot-active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Show image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
