"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { propertyFormSchema, type PropertyFormValues } from "@/lib/validations";
import { createProperty, updateProperty } from "@/lib/actions";
import { LocationPicker } from "@/components/map/location-picker";
import type { Property } from "@prisma/client";

type SerializedProperty = Omit<Property, "price"> & { price: number };

type ProjectOption = { id: string; title: string };

type PropertyFormProps = {
  mode: "create" | "edit";
  property?: SerializedProperty | null;
  projects?: ProjectOption[];
  onCreated?: (id: string) => void;
};

export function PropertyForm({ mode, property, projects, onCreated }: PropertyFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property
      ? {
          title: property.title,
          slug: property.slug,
          shortDescription: property.shortDescription ?? "",
          description: property.description,
          price: Number(property.price),
          currency: property.currency,
          city: property.city,
          neighborhood: property.neighborhood ?? "",
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
          propertyType: property.propertyType ?? "",
          bedrooms: property.bedrooms ?? undefined,
          bathrooms: property.bathrooms ?? undefined,
          areaSqm: property.areaSqm ?? undefined,
          floor: property.floor ?? "",
          parking: property.parking,
          balcony: property.balcony,
          videoUrl: property.videoUrl ?? "",
          websiteUrl: property.websiteUrl ?? "",
          sellerName: property.sellerName,
          sellerEmail: property.sellerEmail,
          sellerPhone: property.sellerPhone,
          published: property.published,
          featured: property.featured,
          metaTitle: property.metaTitle ?? "",
          metaDescription: property.metaDescription ?? "",
          projectId: property.projectId ?? "",
        }
      : {
          published: false,
          featured: false,
          parking: false,
          balcony: false,
          currency: "EUR",
        },
  });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const [autoSlug, setAutoSlug] = useState(mode === "create");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (autoSlug) {
      setValue("slug", slugify(e.target.value));
    }
  }

  async function onSubmit(values: PropertyFormValues) {
    setServerError(null);
    const result =
      mode === "create"
        ? await createProperty(values)
        : await updateProperty(property!.id, values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    if (mode === "create" && result.id && onCreated) {
      onCreated(result.id);
    } else if (mode === "create" && result.id) {
      router.push(`/admin/properties/${result.id}`);
    } else {
      router.push("/admin/properties");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form card">
      {serverError && <p className="form-error">{serverError}</p>}

      <div className="admin-form-grid">
        <label>
          <span>Title</span>
          <input {...register("title", { onChange: handleTitleChange })} placeholder="Sea View Penthouse" />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </label>
        <label>
          <span>Slug {autoSlug && <span className="muted" style={{ fontSize: "0.8rem" }}>(auto)</span>}</span>
          <input {...register("slug", { onChange: () => setAutoSlug(false) })} placeholder="sea-view-penthouse" />
          {errors.slug && <span className="field-error">{errors.slug.message}</span>}
        </label>
        <label>
          <span>City</span>
          <input {...register("city")} placeholder="Larnaca" />
          {errors.city && <span className="field-error">{errors.city.message}</span>}
        </label>
        <label>
          <span>Price</span>
          <input {...register("price")} type="number" placeholder="820000" />
          {errors.price && <span className="field-error">{errors.price.message}</span>}
        </label>
        <label>
          <span>Property type</span>
          <input {...register("propertyType")} placeholder="Apartment" />
        </label>
        <label>
          <span>Bedrooms</span>
          <input {...register("bedrooms")} type="number" placeholder="3" />
        </label>
        <label>
          <span>Bathrooms</span>
          <input {...register("bathrooms")} type="number" placeholder="2" />
        </label>
        <label>
          <span>Area sqm</span>
          <input {...register("areaSqm")} type="number" placeholder="146" />
        </label>
        <label>
          <span>Address</span>
          <input {...register("address")} placeholder="Skala Area, Larnaca" />
          {errors.address && <span className="field-error">{errors.address.message}</span>}
        </label>
        <label>
          <span>Neighborhood</span>
          <input {...register("neighborhood")} placeholder="Optional" />
        </label>
        <label>
          <span>Floor</span>
          <input {...register("floor")} placeholder="3rd" />
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

      <div className="admin-form-grid">
        <label>
          <span>Seller name</span>
          <input {...register("sellerName")} placeholder="Sales Office" />
          {errors.sellerName && <span className="field-error">{errors.sellerName.message}</span>}
        </label>
        <label>
          <span>Seller email</span>
          <input {...register("sellerEmail")} type="email" placeholder="sales@example.com" />
          {errors.sellerEmail && <span className="field-error">{errors.sellerEmail.message}</span>}
        </label>
        <label>
          <span>Seller phone</span>
          <input {...register("sellerPhone")} placeholder="+357-99-123456" />
          {errors.sellerPhone && <span className="field-error">{errors.sellerPhone.message}</span>}
        </label>
      </div>

      <label>
        <span>Short description</span>
        <input {...register("shortDescription")} placeholder="Brief summary for cards" />
      </label>

      <label>
        <span>Description</span>
        <textarea {...register("description")} placeholder="Full property description" rows={6} />
        {errors.description && <span className="field-error">{errors.description.message}</span>}
      </label>

      <label>
        <span>Video URL</span>
        <input {...register("videoUrl")} placeholder="https://example.com/video" />
      </label>

      <label>
        <span>Website URL</span>
        <input {...register("websiteUrl")} placeholder="https://example.com" />
      </label>

      {projects && projects.length > 0 && (
        <label>
          <span>Project</span>
          <select {...register("projectId")} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "white" }}>
            <option value="">None — standalone property</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
      )}

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

      <div className="checkbox-row">
        <label><input type="checkbox" {...register("published")} /> Published</label>
        <label><input type="checkbox" {...register("featured")} /> Featured</label>
        <label><input type="checkbox" {...register("parking")} /> Parking</label>
        <label><input type="checkbox" {...register("balcony")} /> Balcony</label>
      </div>

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create property" : "Save changes"}
        </button>
        <button type="button" className="button-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
