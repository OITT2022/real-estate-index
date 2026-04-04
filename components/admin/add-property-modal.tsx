"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFormSchema, type PropertyFormValues } from "@/lib/validations";
import { createProperty } from "@/lib/actions";

type Props = {
  projectId: string;
  projectTitle: string;
};

export function AddPropertyModal({ projectId, projectTitle }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      published: false,
      featured: false,
      parking: false,
      balcony: false,
      currency: "EUR",
      projectId,
      latitude: 34.9056,
      longitude: 33.6232,
    },
  });

  function slugify(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  async function onSubmit(values: PropertyFormValues) {
    setServerError(null);
    const result = await createProperty({ ...values, projectId });
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className="button-primary" onClick={() => setOpen(true)}>
        + Add Property
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Add Property to {projectTitle}</h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>This property will be automatically linked to the project.</p>
          </div>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} title="Close">
            <span style={{ fontSize: "1.2rem" }}>&times;</span>
          </button>
        </div>

        {serverError && <p className="form-error">{serverError}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          <div className="admin-form-grid">
            <label>
              <span>Title</span>
              <input {...register("title", { onChange: (e) => setValue("slug", slugify(e.target.value)) })} placeholder="2-Bed Apartment A1" />
              {errors.title && <span className="field-error">{errors.title.message}</span>}
            </label>
            <label>
              <span>Slug</span>
              <input {...register("slug")} placeholder="2-bed-apartment-a1" />
            </label>
            <label>
              <span>Price</span>
              <input {...register("price")} type="number" placeholder="230000" />
              {errors.price && <span className="field-error">{errors.price.message}</span>}
            </label>
            <label>
              <span>Currency</span>
              <input {...register("currency")} placeholder="EUR" />
            </label>
            <label>
              <span>City</span>
              <input {...register("city")} placeholder="Larnaca" />
              {errors.city && <span className="field-error">{errors.city.message}</span>}
            </label>
            <label>
              <span>Address</span>
              <input {...register("address")} placeholder="Address" />
              {errors.address && <span className="field-error">{errors.address.message}</span>}
            </label>
            <label>
              <span>Property Type</span>
              <input {...register("propertyType")} placeholder="Apartment" />
            </label>
            <label>
              <span>Bedrooms</span>
              <input {...register("bedrooms")} type="number" placeholder="2" />
            </label>
            <label>
              <span>Bathrooms</span>
              <input {...register("bathrooms")} type="number" placeholder="1" />
            </label>
            <label>
              <span>Area sqm</span>
              <input {...register("areaSqm")} type="number" placeholder="70" />
            </label>
            <label>
              <span>Unit Number</span>
              <input {...register("unitNumber")} placeholder="4A" />
            </label>
            <label>
              <span>Floor</span>
              <input {...register("floor")} type="number" placeholder="2" />
            </label>
            <label>
              <span>Seller Name</span>
              <input {...register("sellerName")} placeholder="Sales Office" />
              {errors.sellerName && <span className="field-error">{errors.sellerName.message}</span>}
            </label>
            <label>
              <span>Seller Email</span>
              <input {...register("sellerEmail")} type="email" placeholder="sales@example.com" />
              {errors.sellerEmail && <span className="field-error">{errors.sellerEmail.message}</span>}
            </label>
            <label>
              <span>Seller Phone</span>
              <input {...register("sellerPhone")} placeholder="+357-99-123456" />
              {errors.sellerPhone && <span className="field-error">{errors.sellerPhone.message}</span>}
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea {...register("description")} placeholder="Property description..." rows={3} />
            {errors.description && <span className="field-error">{errors.description.message}</span>}
          </label>

          <input type="hidden" {...register("latitude")} />
          <input type="hidden" {...register("longitude")} />

          <div className="checkbox-row">
            <label><input type="checkbox" {...register("published")} /> Published</label>
            <label><input type="checkbox" {...register("parking")} /> Parking</label>
            <label><input type="checkbox" {...register("balcony")} /> Balcony</label>
          </div>

          <div className="admin-actions">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Property"}
            </button>
            <button type="button" className="button-secondary" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
