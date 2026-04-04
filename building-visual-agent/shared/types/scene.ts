import type { FacadeName, ProjectInput } from './project';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ApartmentMeshMeta {
  apartmentId: string;
  unitNumber: string;
  rooms: number;
  areaSqm: number;
  status?: string;
  buildingId: string;
  entranceId: string;
  floorNumber: number;
}

export interface ApartmentMeshSpec {
  type: 'apartmentBox';
  id: string;
  position: Vec3;
  size: Vec3;
  highlighted?: boolean;
  meta: ApartmentMeshMeta;
}

export interface FacadeMapping {
  face: FacadeName;
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

export interface CameraSpec {
  target: Vec3;
  distance: number;
  yaw: number;
  pitch: number;
}

export interface BuildingEnvelopeSpec {
  buildingId: string;
  position: Vec3;
  size: Vec3;
  entranceCount: number;
  floorCount: number;
}

export interface SceneSpec {
  project: Pick<ProjectInput['project'], 'id' | 'name' | 'location'>;
  camera: CameraSpec;
  apartments: ApartmentMeshSpec[];
  envelopes: BuildingEnvelopeSpec[];
  facades: FacadeMapping[];
}
