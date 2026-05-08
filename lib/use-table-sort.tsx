"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export type SortDirection = "asc" | "desc";

export type Comparator<T, K extends string> = (a: T, b: T, key: K) => number;

/**
 * Generic table sort hook.
 *
 *   const { sorted, sortKey, sortDir, toggleSort } = useTableSort(rows, compare);
 *
 * `compare` returns the unsigned comparison; the hook flips it for desc.
 */
export function useTableSort<T, K extends string>(
  rows: T[],
  compare: Comparator<T, K>,
) {
  const [sortKey, setSortKey] = useState<K | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const cmp = compare(a, b, sortKey);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir, compare]);

  function toggleSort(key: K) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return { sorted, sortKey, sortDir, toggleSort };
}

export function SortIcon({ active, dir }: { active: boolean; dir: SortDirection }) {
  if (!active) return null;
  return dir === "asc"
    ? <ChevronUp size={14} style={{ marginLeft: 2, opacity: 0.7 }} />
    : <ChevronDown size={14} style={{ marginLeft: 2, opacity: 0.7 }} />;
}
