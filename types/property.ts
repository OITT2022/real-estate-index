export type PropertyStatus = "DRAFT" | "ACTIVE" | "SOLD" | "ARCHIVED";

export type PropertySummary = {
  id: string;
  title: string;
  slug: string;
  city: string;
  price: number;
  published: boolean;
};
