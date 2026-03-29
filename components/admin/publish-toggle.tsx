"use client";

import { useRouter } from "next/navigation";
import { togglePropertyPublish, toggleProjectPublish } from "@/lib/actions";

type Props = {
  type: "property" | "project";
  id: string;
  published: boolean;
};

export function PublishToggle({ type, id, published }: Props) {
  const router = useRouter();

  async function handleToggle() {
    if (type === "property") {
      await togglePropertyPublish(id);
    } else {
      await toggleProjectPublish(id);
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`publish-badge ${published ? "publish-badge-on" : "publish-badge-off"}`}
      title={published ? "Click to unpublish" : "Click to publish"}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
