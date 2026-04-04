import type { getProjectById } from "@/lib/site-data";

/**
 * Types derived from Prisma query return.
 * getProjectById includes: images, documents, properties (with images), units (with property { id, title }).
 */
type ProjectWithRelations = NonNullable<Awaited<ReturnType<typeof getProjectById>>>;

// building-visual-agent input types (inlined to avoid cross-project import issues)
interface Apartment {
  id: string;
  unitNumber: string;
  rooms: number;
  areaSqm: number;
  status?: "available" | "reserved" | "sold" | "hidden";
  price?: number;
  images?: string[];
}

interface Floor {
  floorNumber: number;
  apartments: Apartment[];
}

interface Entrance {
  id: string;
  name?: string;
  floors: Floor[];
}

interface Building {
  id: string;
  name?: string;
  entrances: Entrance[];
}

interface ProjectImages {
  front?: string;
  left?: string;
  right?: string;
  back?: string;
  gallery?: string[];
}

interface LayoutSettings {
  defaultApartmentWidth?: number;
  floorHeight?: number;
  buildingDepth?: number;
  gapBetweenEntrances?: number;
}

export interface ProjectInput {
  project: {
    id: string;
    name: string;
    location?: string;
    images: ProjectImages;
  };
  buildings: Building[];
  selectedApartmentId?: string;
  settings?: LayoutSettings;
}

const STATUS_MAP: Record<string, Apartment["status"]> = {
  ACTIVE: "available",
  DRAFT: "available",
  SOLD: "sold",
  ARCHIVED: "hidden",
};

/**
 * Transform Prisma project data into the ProjectInput format
 * expected by the building-visual-agent scene generator.
 * Returns null if the project has no units.
 */
export function transformProjectToInput(project: ProjectWithRelations): ProjectInput | null {
  if (!project.units.length) return null;

  // Build property lookup from the full properties array
  const propertyMap = new Map<string, ProjectWithRelations["properties"][number]>();
  for (const p of project.properties) {
    propertyMap.set(p.id, p);
  }

  // Map project images to facade positions (first 4 by sort order)
  const facadeImages = mapFacadeImages(project.images);

  // Group units: building → entrance → floor → apartments
  const buildingMap = new Map<string, Map<string, Map<number, Apartment[]>>>();

  for (const unit of project.units) {
    const prop = unit.propertyId ? propertyMap.get(unit.propertyId) : null;

    const apartment: Apartment = {
      id: unit.id,
      unitNumber: unit.unitNumber,
      rooms: prop?.bedrooms ?? 1,
      areaSqm: prop?.areaSqm ?? 50,
      status: prop ? STATUS_MAP[prop.status] ?? "available" : "available",
      price: prop ? Number(prop.price) : undefined,
      images: prop?.images?.map((img) => img.url),
    };

    // Building level
    if (!buildingMap.has(unit.building)) {
      buildingMap.set(unit.building, new Map());
    }
    const entranceMap = buildingMap.get(unit.building)!;

    // Entrance level
    if (!entranceMap.has(unit.entrance)) {
      entranceMap.set(unit.entrance, new Map());
    }
    const floorMap = entranceMap.get(unit.entrance)!;

    // Floor level
    if (!floorMap.has(unit.floor)) {
      floorMap.set(unit.floor, []);
    }
    floorMap.get(unit.floor)!.push(apartment);
  }

  // Convert nested maps to the Building[] hierarchy
  const buildings: Building[] = [];
  const sortedBuildings = [...buildingMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [buildingKey, entranceMap] of sortedBuildings) {
    const entrances: Entrance[] = [];
    const sortedEntrances = [...entranceMap.entries()].sort(([a], [b]) => a.localeCompare(b));

    for (const [entranceKey, floorMap] of sortedEntrances) {
      const floors: Floor[] = [];
      const sortedFloors = [...floorMap.entries()].sort(([a], [b]) => a - b);

      for (const [floorNumber, apartments] of sortedFloors) {
        floors.push({ floorNumber, apartments });
      }

      entrances.push({
        id: `${buildingKey}-${entranceKey}`,
        name: `Entrance ${entranceKey}`,
        floors,
      });
    }

    buildings.push({
      id: buildingKey,
      name: `Building ${buildingKey}`,
      entrances,
    });
  }

  return {
    project: {
      id: project.id,
      name: project.title,
      location: project.city,
      images: facadeImages,
    },
    buildings,
    settings: {
      defaultApartmentWidth: 3.2,
      floorHeight: 3,
      buildingDepth: 8,
      gapBetweenEntrances: 1.5,
    },
  };
}

/**
 * Assign project images to facade faces.
 * Uses alt text hints (front/left/right/back) or falls back to position order.
 */
function mapFacadeImages(images: ProjectWithRelations["images"]): ProjectImages {
  const result: ProjectImages = { gallery: [] };
  const used = new Set<string>();

  // First pass: check alt text for facade hints
  for (const img of images) {
    const alt = (img.altText ?? "").toLowerCase();
    if (alt.includes("front") && !result.front) {
      result.front = img.url;
      used.add(img.id);
    } else if (alt.includes("left") && !result.left) {
      result.left = img.url;
      used.add(img.id);
    } else if (alt.includes("right") && !result.right) {
      result.right = img.url;
      used.add(img.id);
    } else if (alt.includes("back") && !result.back) {
      result.back = img.url;
      used.add(img.id);
    }
  }

  // Second pass: fill remaining facade slots from unused images by sort order
  const facadeSlots: (keyof Pick<ProjectImages, "front" | "left" | "right" | "back">)[] = [
    "front", "left", "right", "back",
  ];
  for (const img of images) {
    if (used.has(img.id)) continue;
    const emptySlot = facadeSlots.find((s) => !result[s]);
    if (emptySlot) {
      result[emptySlot] = img.url;
      used.add(img.id);
    } else {
      result.gallery!.push(img.url);
    }
  }

  return result;
}
