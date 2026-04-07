"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { z } from "zod";
import { createAdminInquiry } from "@/lib/actions";

const adminInquirySchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters"),
  propertyId: z.string().min(1, "Property is required"),
  status: z.string(),
});

type FormValues = z.infer<typeof adminInquirySchema>;

type CustomerOption = { id: string; companyName: string };
type ProjectOption = { id: string; title: string; customerId: string | null };
type PropertyOption = { id: string; title: string; projectId: string | null; customerId: string | null };

type Props = {
  customers: CustomerOption[];
  projects: ProjectOption[];
  properties: PropertyOption[];
  isSuperAdmin: boolean;
};

export function AdminInquiryForm({ customers, projects, properties, isSuperAdmin }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(adminInquirySchema),
    defaultValues: { status: "new" },
  });

  // Filter projects by selected customer
  const filteredProjects = useMemo(() => {
    if (!selectedCustomerId) return projects;
    return projects.filter((p) => p.customerId === selectedCustomerId);
  }, [projects, selectedCustomerId]);

  // Filter properties by selected project or customer
  const filteredProperties = useMemo(() => {
    if (selectedProjectId) {
      return properties.filter((p) => p.projectId === selectedProjectId);
    }
    if (selectedCustomerId) {
      return properties.filter(
        (p) => p.customerId === selectedCustomerId || filteredProjects.some((pr) => pr.id === p.projectId)
      );
    }
    return properties;
  }, [properties, selectedProjectId, selectedCustomerId, filteredProjects]);

  function handleCustomerChange(customerId: string) {
    setSelectedCustomerId(customerId);
    setSelectedProjectId("");
  }

  function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await createAdminInquiry(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/inquiries");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form card">
      {serverError && <p className="form-error">{serverError}</p>}

      {/* Cascading selects: Customer → Project → Property */}
      {isSuperAdmin && customers.length > 0 && (
        <label>
          <span>Customer (optional filter)</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </label>
      )}

      {filteredProjects.length > 0 && (
        <label>
          <span>Project (optional filter)</span>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">All Projects</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
      )}

      <label>
        <span>Property *</span>
        <select {...register("propertyId")}>
          <option value="">Select a property...</option>
          {filteredProperties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        {errors.propertyId && <span className="field-error">{errors.propertyId.message}</span>}
      </label>

      <div className="admin-form-grid">
        <label>
          <span>Full Name *</span>
          <input {...register("fullName")} placeholder="John Smith" />
          {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
        </label>
        <label>
          <span>Email *</span>
          <input {...register("email")} type="email" placeholder="john@example.com" />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>
        <label>
          <span>Phone</span>
          <input {...register("phone")} placeholder="+357-99-123456" />
        </label>
        <label>
          <span>Status</span>
          <select {...register("status")}>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>

      <label>
        <span>Message *</span>
        <textarea {...register("message")} placeholder="Inquiry details..." rows={5} />
        {errors.message && <span className="field-error">{errors.message.message}</span>}
      </label>

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Inquiry"}
        </button>
        <button type="button" className="button-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
