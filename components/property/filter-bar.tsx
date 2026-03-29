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
      <select name="city" defaultValue={current.city}>
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select name="propertyType" defaultValue={current.propertyType}>
        <option value="">All types</option>
        {propertyTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select name="bedrooms" defaultValue={current.bedrooms}>
        <option value="">Bedrooms</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>
      <input name="minPrice" type="number" placeholder="Min price" defaultValue={current.minPrice} />
      <input name="maxPrice" type="number" placeholder="Max price" defaultValue={current.maxPrice} />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="button-primary">Search</button>
        {hasFilters && (
          <button type="button" className="button-secondary" onClick={clear}>Clear</button>
        )}
      </div>
    </form>
  );
}
