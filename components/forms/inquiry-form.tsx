"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations";
import { createInquiry } from "@/lib/actions";

type InquiryFormProps = {
  propertyId: string;
  propertyTitle: string;
};

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { propertyId },
  });

  async function onSubmit(values: InquiryFormValues) {
    setServerError(null);
    const result = await createInquiry(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="inquiry-card">
        <div className="inquiry-success">
          <div className="inquiry-success-icon">&#10003;</div>
          <h3>Message sent!</h3>
          <p>Your inquiry about <strong>{propertyTitle}</strong> has been delivered. The seller will contact you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="inquiry-card">
      <input type="hidden" {...register("propertyId")} />
      <div className="inquiry-header">
        <div className="inquiry-icon">&#9993;</div>
        <div>
          <h3 style={{ margin: 0 }}>Interested in this property?</h3>
          <p className="muted" style={{ margin: "4px 0 0" }}>Get in touch with the seller about {propertyTitle}</p>
        </div>
      </div>

      {serverError && <p className="form-error">{serverError}</p>}

      <div className="inquiry-fields">
        <div className="inquiry-row">
          <label className="inquiry-label">
            <input {...register("fullName")} placeholder="Full name *" className="inquiry-input" />
            {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
          </label>
          <label className="inquiry-label">
            <input {...register("email")} type="email" placeholder="Email address *" className="inquiry-input" />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
        </div>
        <label className="inquiry-label">
          <input {...register("phone")} placeholder="Phone number (optional)" className="inquiry-input" />
        </label>
        <label className="inquiry-label">
          <textarea {...register("message")} placeholder="Hi, I'm interested in this property and would like to know more..." rows={4} className="inquiry-input" />
          {errors.message && <span className="field-error">{errors.message.message}</span>}
        </label>
      </div>

      <button type="submit" className="inquiry-submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
