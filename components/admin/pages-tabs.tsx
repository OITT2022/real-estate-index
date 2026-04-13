"use client";

import { useState, type ReactNode } from "react";

type Props = {
  homepageContent: ReactNode;
  aboutContent: ReactNode;
  contactContent: ReactNode;
};

const TABS = [
  { key: "homepage", label: "Homepage" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
] as const;

export function PagesTabs({ homepageContent, aboutContent, contactContent }: Props) {
  const [active, setActive] = useState<string>("homepage");

  return (
    <div>
      <div className="pages-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`pages-tab${active === tab.key ? " pages-tab-active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {active === "homepage" && homepageContent}
        {active === "about" && aboutContent}
        {active === "contact" && contactContent}
      </div>
    </div>
  );
}
