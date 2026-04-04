export type FacadeName = 'front' | 'left' | 'right' | 'back';

export interface ProjectImages {
  front?: string;
  left?: string;
  right?: string;
  back?: string;
  gallery?: string[];
}

export interface Apartment {
  id: string;
  unitNumber: string;
  rooms: number;
  areaSqm: number;
  status?: 'available' | 'reserved' | 'sold' | 'hidden';
  price?: number;
  images?: string[];
}

export interface Floor {
  floorNumber: number;
  apartments: Apartment[];
}

export interface Entrance {
  id: string;
  name?: string;
  floors: Floor[];
}

export interface Building {
  id: string;
  name?: string;
  entrances: Entrance[];
}

export interface LayoutSettings {
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
