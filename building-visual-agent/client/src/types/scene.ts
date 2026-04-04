export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ApartmentMeshSpec {
  type: 'apartmentBox';
  id: string;
  position: Vec3;
  size: Vec3;
  highlighted?: boolean;
  meta: {
    apartmentId: string;
    unitNumber: string;
    rooms: number;
    areaSqm: number;
    status?: string;
    buildingId: string;
    entranceId: string;
    floorNumber: number;
  };
}

export interface FacadeMapping {
  face: 'front' | 'left' | 'right' | 'back';
  image: string;
  confidence: number;
  uv: {
    offsetX: number;
    offsetY: number;
    repeatX: number;
    repeatY: number;
    rotation: number;
  };
}

export interface BuildingEnvelopeSpec {
  buildingId: string;
  position: Vec3;
  size: Vec3;
  entranceCount: number;
  floorCount: number;
}

export interface CameraSpec {
  target: Vec3;
  distance: number;
  yaw: number;
  pitch: number;
}

export interface SceneSpec {
  project: {
    id: string;
    name: string;
    location?: string;
  };
  camera: CameraSpec;
  apartments: ApartmentMeshSpec[];
  envelopes: BuildingEnvelopeSpec[];
  facades: FacadeMapping[];
}
