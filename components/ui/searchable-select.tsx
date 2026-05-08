"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type SearchableOption = {
  value: string;
  label: string;
  /** Lower-cased haystack used for filtering (label + extras like dial code, alt names). */
  searchText?: string;
};

type Props = {
  options: SearchableOption[];
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Optional renderer for each option row (e.g. flag + name + code). */
  renderOption?: (opt: SearchableOption) => React.ReactNode;
  /** Optional renderer for the selected value in the trigger. */
  renderTrigger?: (opt: SearchableOption | null) => React.ReactNode;
  className?: string;
  /** Minimal trigger (used inside the unified phone input). */
  compact?: boolean;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  renderOption,
  renderTrigger,
  className,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => (o.searchText ?? o.label).toLowerCase().includes(q));
  }, [options, query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Reset query + focus input when opening.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keep active option in view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={`ss-wrap ${className ?? ""}`}>
      <button
        type="button"
        className={`ss-trigger ${compact ? "ss-trigger-compact" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ss-trigger-content">
          {renderTrigger
            ? renderTrigger(selected)
            : selected
              ? selected.label
              : <span className="ss-placeholder">{placeholder}</span>}
        </span>
        <ChevronDown size={16} className="ss-chevron" />
      </button>

      {open && (
        <div className="ss-popover">
          <div className="ss-search">
            <Search size={14} className="ss-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKey}
              placeholder="Search…"
              aria-controls={listboxId}
            />
          </div>
          <ul ref={listRef} role="listbox" id={listboxId} className="ss-list">
            {filtered.length === 0 && (
              <li className="ss-empty">No matches</li>
            )}
            {filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`ss-option ${i === activeIndex ? "ss-option-active" : ""} ${opt.value === value ? "ss-option-selected" : ""}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  // mousedown (not click) so the input doesn't blur first.
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {renderOption ? renderOption(opt) : opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
