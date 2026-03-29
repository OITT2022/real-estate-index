"use client";

import { useState } from "react";
import type { PropertyImage } from "@prisma/client";

type Props = {
  title: string;
  images: PropertyImage[];
};

export function PropertyGallery({ title, images }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <section className="property-gallery-grid">
        <div className="gallery-main">
          <div className="gallery-label">No images available</div>
        </div>
      </section>
    );
  }

  const primary = images.find((img) => img.isPrimary) ?? images[0];
  const ordered = [primary, ...images.filter((img) => img.id !== primary.id)];

  return (
    <>
      <section className="property-gallery-grid">
        <div
          className="gallery-main"
          onClick={() => { setActiveIdx(0); setLightboxOpen(true); }}
          style={{ cursor: "pointer" }}
        >
          <img
            src={ordered[0].url}
            alt={ordered[0].altText ?? title}
            className="gallery-image"
          />
          {images.length > 1 && (
            <span className="gallery-count">{images.length} photos</span>
          )}
        </div>
        {ordered.length > 1 && (
          <div className="gallery-side-grid">
            {ordered.slice(1, 5).map((img, i) => (
              <div
                key={img.id}
                className="gallery-thumb"
                onClick={() => { setActiveIdx(i + 1); setLightboxOpen(true); }}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? title}
                  className="gallery-image"
                />
                {i === 3 && ordered.length > 5 && (
                  <div className="gallery-more-overlay">
                    +{ordered.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

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
