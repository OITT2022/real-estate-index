"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";

type Props = {
  cities: string[];
  propertyTypes: string[];
  /** Path to navigate to on submit/clear. Defaults to "/". */
  target?: string;
};

export function FilterBar({ cities, propertyTypes, target = "/" }: Props) {
  const t = useTranslations("search");
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
      router.push(qs ? `${target}?${qs}` : target);
    },
    [router, target]
  );

  const clear = useCallback(() => router.push(target), [router, target]);

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <form className="filter-bar" onSubmit={submit}>
      <div>
        <span className="filter-bar-label">{t("minPrice")}</span>
        <input name="minPrice" type="number" placeholder={t("noMin")} defaultValue={current.minPrice} />
      </div>
      <div>
        <span className="filter-bar-label">{t("maxPrice")}</span>
        <input name="maxPrice" type="number" placeholder={t("noMax")} defaultValue={current.maxPrice} />
      </div>
      <div>
        <span className="filter-bar-label">{t("propertyType")}</span>
        <select name="propertyType" defaultValue={current.propertyType}>
          <option value="">{t("showAll")}</option>
          {propertyTypes.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <span className="filter-bar-label">{t("bedrooms")}</span>
        <select name="bedrooms" defaultValue={current.bedrooms}>
          <option value="">{t("bedroomsAny")}</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <span className="filter-bar-label">{t("propertyLocation")}</span>
        <select name="city" defaultValue={current.city}>
          <option value="">{t("allCities")}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
        <button type="submit" className="button-primary" style={{ flex: 1, padding: "14px 24px" }}>
          {t("submit")}
        </button>
        {hasFilters && (
          <button type="button" className="button-secondary" onClick={clear}>{t("clear")}</button>
        )}
      </div>
    </form>
  );
}
