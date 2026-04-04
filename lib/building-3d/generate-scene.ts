import type { ProjectInput } from "./transform-project";

// Scene types matching building-visual-agent/client/src/types/scene.ts
export interface Vec3 { x: number; y: number; z: number }

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
  type: "apartmentBox";
  id: string;
  position: Vec3;
  size: Vec3;
  highlighted?: boolean;
  meta: ApartmentMeshMeta;
}

export interface BuildingEnvelopeSpec {
  buildingId: string;
  position: Vec3;
  size: Vec3;
  entranceCount: number;
  floorCount: number;
}

export interface FacadeMapping {
  face: "front" | "left" | "right" | "back";
  image: string;
  confidence: number;
  uv: { offsetX: number; offsetY: number; repeatX: number; repeatY: number; rotation: number };
}

export interface CameraSpec {
  target: Vec3;
  distance: number;
  yaw: number;
  pitch: number;
}

export interface SceneSpec {
  project: { id: string; name: string; location?: string };
  camera: CameraSpec;
  apartments: ApartmentMeshSpec[];
  envelopes: BuildingEnvelopeSpec[];
  facades: FacadeMapping[];
}

// --- Pipeline functions (ported from building-visual-agent server services) ---

function generateLayout(project: ProjectInput) {
  const apartmentWidth = project.settings?.defaultApartmentWidth ?? 3.2;
  const floorHeight = project.settings?.floorHeight ?? 3;
  const buildingDepth = project.settings?.buildingDepth ?? 8;
  const gapBetweenEntrances = project.settings?.gapBetweenEntrances ?? 1.5;

  const apartments: ApartmentMeshSpec[] = [];
  const envelopes: BuildingEnvelopeSpec[] = [];
  let buildingOffsetX = 0;

  for (const building of project.buildings) {
    const buildingStartX = buildingOffsetX;
    let maxFloorNumber = 0;
    let totalEntrances = 0;

    for (const entrance of building.entrances) {
      const sortedFloors = [...entrance.floors].sort((a, b) => a.floorNumber - b.floorNumber);

      let entranceMaxAptsPerFloor = 0;
      for (const floor of sortedFloors) {
        entranceMaxAptsPerFloor = Math.max(entranceMaxAptsPerFloor, floor.apartments.length);
        maxFloorNumber = Math.max(maxFloorNumber, floor.floorNumber);
      }

      for (const floor of sortedFloors) {
        const y = (floor.floorNumber - 1) * floorHeight;
        for (let i = 0; i < floor.apartments.length; i++) {
          const apt = floor.apartments[i];
          apartments.push({
            type: "apartmentBox",
            id: apt.id,
            position: { x: buildingOffsetX + i * apartmentWidth, y, z: 0 },
            size: { x: apartmentWidth, y: floorHeight * 0.9, z: buildingDepth },
            highlighted: apt.id === project.selectedApartmentId,
            meta: {
              apartmentId: apt.id,
              unitNumber: apt.unitNumber,
              rooms: apt.rooms,
              areaSqm: apt.areaSqm,
              status: apt.status,
              buildingId: building.id,
              entranceId: entrance.id,
              floorNumber: floor.floorNumber,
            },
          });
        }
      }

      const entranceWidth = Math.max(entranceMaxAptsPerFloor, 1) * apartmentWidth;
      buildingOffsetX += entranceWidth + gapBetweenEntrances;
      totalEntrances++;
    }

    buildingOffsetX -= gapBetweenEntrances;
    const buildingWidth = buildingOffsetX - buildingStartX;
    const buildingHeight = maxFloorNumber * floorHeight;

    envelopes.push({
      buildingId: building.id,
      position: { x: buildingStartX, y: 0, z: 0 },
      size: { x: buildingWidth, y: buildingHeight, z: buildingDepth },
      entranceCount: totalEntrances,
      floorCount: maxFloorNumber,
    });

    buildingOffsetX += gapBetweenEntrances;
  }

  return { apartments, envelopes };
}

function autoMapFacades(project: ProjectInput): FacadeMapping[] {
  const faces = ["front", "left", "right", "back"] as const;
  return faces
    .filter((face) => project.project.images[face])
    .map((face) => ({
      face,
      image: project.project.images[face] as string,
      confidence: face === "front" ? 0.92 : 0.85,
      uv: { offsetX: 0, offsetY: 0, repeatX: 1, repeatY: 1, rotation: 0 },
    }));
}

/**
 * Generate a complete SceneSpec from a ProjectInput.
 * This is the main entry point — call after transformProjectToInput().
 */
export function generateSceneFromProject(input: ProjectInput): SceneSpec {
  const layout = generateLayout(input);
  const facades = autoMapFacades(input);

  // Compute bounds from envelopes
  let maxX = 0, maxY = 0, maxZ = 0;
  for (const env of layout.envelopes) {
    maxX = Math.max(maxX, env.position.x + env.size.x);
    maxY = Math.max(maxY, env.position.y + env.size.y);
    maxZ = Math.max(maxZ, env.position.z + env.size.z);
  }
  if (maxX === 0) maxX = 10;
  if (maxY === 0) maxY = 6;

  const diagonal = Math.sqrt(maxX * maxX + maxY * maxY + maxZ * maxZ);

  return {
    project: {
      id: input.project.id,
      name: input.project.name,
      location: input.project.location,
    },
    camera: {
      target: { x: maxX / 2, y: maxY / 2, z: maxZ / 2 },
      distance: diagonal * 1.2,
      yaw: 0.6,
      pitch: 0.35,
    },
    apartments: layout.apartments,
    envelopes: layout.envelopes,
    facades,
  };
}
