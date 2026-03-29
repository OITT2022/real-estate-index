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
      <div className="card inquiry-form">
        <h3>Thank you!</h3>
        <p className="muted">Your inquiry about {propertyTitle} has been sent. The seller will contact you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card inquiry-form">
      <input type="hidden" {...register("propertyId")} />
      <h3>Contact seller</h3>
      <p className="muted">Ask about {propertyTitle}</p>
      {serverError && <p className="form-error">{serverError}</p>}

      <div className="admin-form-grid">
        <label>
          <span>Full name</span>
          <input {...register("fullName")} placeholder="Your full name" />
          {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
        </label>
        <label>
          <span>Email</span>
          <input {...register("email")} type="email" placeholder="you@example.com" />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>
        <label>
          <span>Phone</span>
          <input {...register("phone")} placeholder="Optional" />
        </label>
      </div>
      <label>
        <span>Message</span>
        <textarea {...register("message")} placeholder="I would like more information about this property." rows={5} />
        {errors.message && <span className="field-error">{errors.message.message}</span>}
      </label>
      <button type="submit" className="button-primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
