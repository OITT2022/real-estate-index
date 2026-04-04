import { z } from "zod";

export const propertyFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  currency: z.string(),
  city: z.string().min(2, "City is required"),
  neighborhood: z.string().optional(),
  address: z.string().min(2, "Address is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  propertyType: z.string().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  areaSqm: z.coerce.number().nonnegative().optional(),
  floor: z.string().optional(),
  parking: z.boolean(),
  balcony: z.boolean(),
  videoUrl: z.string().optional().or(z.literal("")),
  websiteUrl: z.string().optional().or(z.literal("")),
  sellerName: z.string().min(2, "Seller name is required"),
  sellerEmail: z.string().email("Valid email required"),
  sellerPhone: z.string().min(5, "Phone is required"),
  published: z.boolean(),
  featured: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  projectId: z.string().optional().or(z.literal("")),
  customerId: z.string().optional().or(z.literal("")),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const projectFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(2, "Address is required"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  developerName: z.string().min(2, "Developer name is required"),
  completionDate: z.string().optional().or(z.literal("")),
  totalUnits: z.coerce.number().int().nonnegative().optional(),
  videoUrl: z.string().optional().or(z.literal("")),
  websiteUrl: z.string().optional().or(z.literal("")),
  published: z.boolean(),
  featured: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  customerId: z.string().optional().or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const inquirySchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
  propertyId: z.string().min(1),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;

export const apiClientFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  allowedPropertyFields: z.array(z.string()),
  allowedProjectFields: z.array(z.string()),
  includeImages: z.boolean(),
  includeDocuments: z.boolean(),
  active: z.boolean(),
});

export type ApiClientFormValues = z.infer<typeof apiClientFormSchema>;

export const customerFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  logoUrl: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  contactName: z.string().optional().or(z.literal("")),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const adminUserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().optional().or(z.literal("")),
  isSuperAdmin: z.boolean(),
  allowedPages: z.array(z.string()),
  customerId: z.string().optional().or(z.literal("")),
  active: z.boolean(),
});

export type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;
