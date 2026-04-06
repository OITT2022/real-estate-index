"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Props = {
  cities: string[];
  propertyTypes: string[];
};

export function FilterBar({ cities, propertyTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const current = {
    city: searchParams.get("city") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
    bedrooms: searchParams.get("bedrooms") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
  };

  const submit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const params = new URLSearchParams();
      for (const [key, value] of fd.entries()) {
        if (value) params.set(key, value as string);
      }
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : "/");
    },
    [router]
  );

  const clear = useCallback(() => router.push("/"), [router]);

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <form className="filter-bar" onSubmit={submit}>
      <div>
        <span className="filter-bar-label">Min Price</span>
        <input name="minPrice" type="number" placeholder="No Min" defaultValue={current.minPrice} />
      </div>
      <div>
        <span className="filter-bar-label">Max Price</span>
        <input name="maxPrice" type="number" placeholder="No Max" defaultValue={current.maxPrice} />
      </div>
      <div>
        <span className="filter-bar-label">Property Type</span>
        <select name="propertyType" defaultValue={current.propertyType}>
          <option value="">Show All</option>
          {propertyTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <span className="filter-bar-label">Bed Rooms</span>
        <select name="bedrooms" defaultValue={current.bedrooms}>
          <option value="">Bedrooms</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <span className="filter-bar-label">Property Location</span>
        <select name="city" defaultValue={current.city}>
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
        <button type="submit" className="button-primary" style={{ flex: 1, padding: "14px 24px" }}>
          Search Result
        </button>
        {hasFilters && (
          <button type="button" className="button-secondary" onClick={clear}>Clear</button>
        )}
      </div>
    </form>
  );
}
