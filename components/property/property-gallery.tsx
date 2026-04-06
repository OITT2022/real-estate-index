"use client";

import { useState } from "react";

type GalleryImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
};

type Props = {
  title: string;
  images: GalleryImage[];
};

export function PropertyGallery({ title, images }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <section className="pg-hero">
        <div className="pg-hero-main">
          <div className="pg-hero-placeholder">No images available</div>
        </div>
      </section>
    );
  }

  const primary = images.find((img) => img.isPrimary) ?? images[0];
  const ordered = [primary, ...images.filter((img) => img.id !== primary.id)];

  return (
    <>
      {/* ── Full-width gallery hero ──────────────────────────── */}
      <section className="pg-hero">
        <div className="pg-hero-grid">
          <div
            className="pg-hero-main"
            onClick={() => { setActiveIdx(0); setLightboxOpen(true); }}
          >
            <img src={ordered[0].url} alt={ordered[0].altText ?? title} />
          </div>
          {ordered.length > 1 && (
            <div
              className="pg-hero-side"
              onClick={() => { setActiveIdx(1); setLightboxOpen(true); }}
            >
              <img src={ordered[1].url} alt={ordered[1].altText ?? title} />
              {images.length > 2 && (
                <button
                  className="pg-view-photos"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(0);
                    setLightboxOpen(true);
                  }}
                >
                  View photos ({images.length})
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>

            <img
              src={ordered[activeIdx].url}
              alt={ordered[activeIdx].altText ?? title}
              className="lightbox-image"
            />

            <div className="lightbox-counter">
              {activeIdx + 1} / {ordered.length}
            </div>

            {ordered.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={() => setActiveIdx((activeIdx - 1 + ordered.length) % ordered.length)}
                  aria-label="Previous"
                >
                  &#8249;
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={() => setActiveIdx((activeIdx + 1) % ordered.length)}
                  aria-label="Next"
                >
                  &#8250;
                </button>
              </>
            )}

            <div className="lightbox-thumbs">
              {ordered.map((img, i) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.altText ?? ""}
                  className={`lightbox-thumb${i === activeIdx ? " lightbox-thumb-active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
