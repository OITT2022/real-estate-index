"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations";
import { createProject, updateProject } from "@/lib/actions";
import { LocationPicker } from "@/components/map/location-picker";
import type { Project } from "@prisma/client";

type SerializedProject = Omit<Project, "createdAt" | "updatedAt"> & { createdAt?: unknown; updatedAt?: unknown };

type CustomerOption = { id: string; companyName: string };

type ProjectFormProps = {
  mode: "create" | "edit";
  project?: SerializedProject | null;
  customers?: CustomerOption[];
  onCreated?: (id: string) => void;
};

export function ProjectForm({ mode, project, customers, onCreated }: ProjectFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription ?? "",
          description: project.description,
          city: project.city,
          address: project.address,
          latitude: project.latitude,
          longitude: project.longitude,
          developerName: project.developerName,
          completionDate: project.completionDate ?? "",
          totalUnits: project.totalUnits ?? undefined,
          videoUrl: project.videoUrl ?? "",
          websiteUrl: project.websiteUrl ?? "",
          published: project.published,
          featured: project.featured,
          metaTitle: project.metaTitle ?? "",
          metaDescription: project.metaDescription ?? "",
          customerId: project.customerId ?? "",
        }
      : { published: false, featured: false, customerId: "" },
  });

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  const [autoSlug, setAutoSlug] = useState(mode === "create");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (autoSlug) setValue("slug", slugify(e.target.value));
  }

  async function onSubmit(values: ProjectFormValues) {
    setServerError(null);
    const result = mode === "create" ? await createProject(values) : await updateProject(project!.id, values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    if (mode === "create" && result.id && onCreated) {
      onCreated(result.id);
    } else if (mode === "create" && result.id) {
      router.push(`/admin/projects/${result.id}`);
    } else {
      router.push("/admin/projects");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form card">
      {serverError && <p className="form-error">{serverError}</p>}

      <div className="admin-form-grid">
        <label>
          <span>Title</span>
          <input {...register("title", { onChange: handleTitleChange })} placeholder="Seaside Residences" />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </label>
        <label>
          <span>Slug {autoSlug && <span className="muted" style={{ fontSize: "0.8rem" }}>(auto)</span>}</span>
          <input {...register("slug", { onChange: () => setAutoSlug(false) })} placeholder="seaside-residences" />
          {errors.slug && <span className="field-error">{errors.slug.message}</span>}
        </label>
        <label>
          <span>Developer Name</span>
          <input {...register("developerName")} placeholder="ABC Developers" />
          {errors.developerName && <span className="field-error">{errors.developerName.message}</span>}
        </label>
        <label>
          <span>Completion Date</span>
          <input {...register("completionDate")} placeholder="Q4 2027" />
        </label>
        <label>
          <span>City</span>
          <input {...register("city")} placeholder="Larnaca" />
          {errors.city && <span className="field-error">{errors.city.message}</span>}
        </label>
        <label>
          <span>Address</span>
          <input {...register("address")} placeholder="Coastal Road, Larnaca" />
          {errors.address && <span className="field-error">{errors.address.message}</span>}
        </label>
        <label>
          <span>Total Units</span>
          <input {...register("totalUnits")} type="number" placeholder="48" />
        </label>
      </div>

      <LocationPicker
        lat={watch("latitude") || 34.9056}
        lng={watch("longitude") || 33.6232}
        onLatChange={(v) => setValue("latitude", v)}
        onLngChange={(v) => setValue("longitude", v)}
      />
      <input {...register("latitude")} type="hidden" />
      <input {...register("longitude")} type="hidden" />

      <label>
        <span>Short Description</span>
        <input {...register("shortDescription")} placeholder="Brief summary for cards" />
      </label>

      <label>
        <span>Description</span>
        <textarea {...register("description")} placeholder="Full project description — area, building, amenities..." rows={8} />
        {errors.description && <span className="field-error">{errors.description.message}</span>}
      </label>

      <label>
        <span>Video URL</span>
        <input {...register("videoUrl")} placeholder="https://youtube.com/..." />
      </label>

      <label>
        <span>Website URL</span>
        <input {...register("websiteUrl")} placeholder="https://example.com" />
      </label>

      <div className="admin-form-grid">
        <label>
          <span>Meta title (SEO)</span>
          <input {...register("metaTitle")} placeholder="Optional SEO title" />
        </label>
        <label>
          <span>Meta description (SEO)</span>
          <input {...register("metaDescription")} placeholder="Optional SEO description" />
        </label>
      </div>

      {customers && customers.length > 0 && (
        <label>
          <span>Customer</span>
          <select {...register("customerId")} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "white" }}>
            <option value="">None</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </label>
      )}

      <div className="checkbox-row">
        <label><input type="checkbox" {...register("published")} /> Published</label>
        <label><input type="checkbox" {...register("featured")} /> Featured</label>
      </div>

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create project" : "Save changes"}
        </button>
        <button type="button" className="button-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
