"use client";

import { useRouter } from "next/navigation";
import { toggleApiEnabled } from "@/lib/actions";

type Props = {
  type: "property" | "project";
  id: string;
  enabled: boolean;
};

export function ApiToggle({ type, id, enabled }: Props) {
  const router = useRouter();

  async function handleToggle() {
    await toggleApiEnabled(type, id);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`api-badge ${enabled ? "api-badge-on" : "api-badge-off"}`}
    >
      {enabled ? "ON" : "OFF"}
    </button>
  );
}
