"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { inquirySchema, type InquiryFormValues } from "@/lib/validations";
import { createInquiry } from "@/lib/actions";

type InquiryFormProps = {
  propertyId: string;
  propertyTitle: string;
};

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const t = useTranslations("inquiry");
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
          <h3>{t("successHeading")}</h3>
          <p>{t("successPropertyBody", { title: propertyTitle })}</p>
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
          <h3 style={{ margin: 0 }}>{t("headingProperty")}</h3>
          <p className="muted" style={{ margin: "4px 0 0" }}>{t("subtitleProperty", { title: propertyTitle })}</p>
        </div>
      </div>

      {serverError && <p className="form-error">{serverError}</p>}

      <div className="inquiry-fields">
        <div className="inquiry-row">
          <label className="inquiry-label">
            <input {...register("fullName")} placeholder={t("fullName")} className="inquiry-input" />
            {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
          </label>
          <label className="inquiry-label">
            <input {...register("email")} type="email" placeholder={t("email")} className="inquiry-input" />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
        </div>
        <label className="inquiry-label">
          <input {...register("phone")} placeholder={t("phone")} className="inquiry-input" />
        </label>
        <label className="inquiry-label">
          <textarea {...register("message")} placeholder={t("messagePropertyPlaceholder")} rows={4} className="inquiry-input" />
          {errors.message && <span className="field-error">{errors.message.message}</span>}
        </label>
      </div>

      <button type="submit" className="inquiry-submit" disabled={isSubmitting}>
        {isSubmitting ? t("sending") : t("send")}
      </button>
    </form>
  );
}
