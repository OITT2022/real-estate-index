export type DemoProperty = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  city: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  published: boolean;
  featured?: boolean;
  videoUrl?: string;
};

export const demoProperties: DemoProperty[] = [
  {
    id: "1",
    title: "Sea View Penthouse",
    slug: "sea-view-penthouse",
    description: "Premium penthouse with wide sea views and a large terrace.",
    price: 820000,
    city: "Larnaca",
    address: "Skala Area, Larnaca",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 146,
    sellerName: "Sales Office",
    sellerEmail: "sales@example.com",
    sellerPhone: "+357-99-123456",
    published: true,
    featured: true,
    videoUrl: "https://example.com/video/sea-view-penthouse",
  },
  {
    id: "2",
    title: "Modern City Apartment",
    slug: "modern-city-apartment",
    description: "Central apartment near services, cafes, and main roads.",
    price: 285000,
    city: "Nicosia",
    address: "City Center",
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 88,
    sellerName: "Sales Office",
    sellerEmail: "sales@example.com",
    sellerPhone: "+357-99-123456",
    published: true,
    featured: false,
    videoUrl: "https://example.com/video/modern-city-apartment",
  },
  {
    id: "3",
    title: "Garden Duplex Residence",
    slug: "garden-duplex-residence",
    description: "Large duplex with private garden and parking.",
    price: 465000,
    city: "Limassol",
    address: "Residential Quarter",
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 172,
    sellerName: "Sales Office",
    sellerEmail: "sales@example.com",
    sellerPhone: "+357-99-123456",
    published: true,
    featured: false,
    videoUrl: "https://example.com/video/garden-duplex-residence",
  }
];
