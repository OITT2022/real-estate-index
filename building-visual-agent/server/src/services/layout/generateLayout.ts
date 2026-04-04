import type { ProjectInput } from '../../../../shared/types/project';
import type { ApartmentMeshSpec, Vec3 } from '../../../../shared/types/scene';

export interface BuildingEnvelope {
  buildingId: string;
  position: Vec3;
  size: Vec3;
  entranceCount: number;
  floorCount: number;
}

export interface LayoutResult {
  layoutType: 'linear';
  apartments: ApartmentMeshSpec[];
  envelopes: BuildingEnvelope[];
}

export function generateLayout(project: ProjectInput): LayoutResult {
  const apartmentWidth = project.settings?.defaultApartmentWidth ?? 3.2;
  const floorHeight = project.settings?.floorHeight ?? 3;
  const buildingDepth = project.settings?.buildingDepth ?? 8;
  const gapBetweenEntrances = project.settings?.gapBetweenEntrances ?? 1.5;

  const apartments: ApartmentMeshSpec[] = [];
  const envelopes: BuildingEnvelope[] = [];
  let buildingOffsetX = 0;

  for (const building of project.buildings) {
    const buildingStartX = buildingOffsetX;
    let maxAptsPerFloor = 0;
    let maxFloorNumber = 0;
    let totalEntrances = 0;

    for (const entrance of building.entrances) {
      const sortedFloors = [...entrance.floors].sort((a, b) => a.floorNumber - b.floorNumber);

      // Find max apartments per floor in this entrance
      let entranceMaxAptsPerFloor = 0;
      for (const floor of sortedFloors) {
        entranceMaxAptsPerFloor = Math.max(entranceMaxAptsPerFloor, floor.apartments.length);
        maxFloorNumber = Math.max(maxFloorNumber, floor.floorNumber);
      }

      for (const floor of sortedFloors) {
        const y = (floor.floorNumber - 1) * floorHeight;

        for (let i = 0; i < floor.apartments.length; i++) {
          const apartment = floor.apartments[i];
          apartments.push({
            type: 'apartmentBox',
            id: apartment.id,
            position: {
              x: buildingOffsetX + i * apartmentWidth,
              y,
              z: 0
            },
            size: {
              x: apartmentWidth,
              y: floorHeight * 0.9,
              z: buildingDepth
            },
            highlighted: apartment.id === project.selectedApartmentId,
            meta: {
              apartmentId: apartment.id,
              unitNumber: apartment.unitNumber,
              rooms: apartment.rooms,
              areaSqm: apartment.areaSqm,
              status: apartment.status,
              buildingId: building.id,
              entranceId: entrance.id,
              floorNumber: floor.floorNumber
            }
          });
        }
      }

      const entranceWidth = Math.max(entranceMaxAptsPerFloor, 1) * apartmentWidth;
      buildingOffsetX += entranceWidth + gapBetweenEntrances;
      maxAptsPerFloor += entranceMaxAptsPerFloor;
      totalEntrances++;
    }

    // Remove trailing gap
    buildingOffsetX -= gapBetweenEntrances;

    const buildingWidth = buildingOffsetX - buildingStartX;
    const buildingHeight = maxFloorNumber * floorHeight;

    envelopes.push({
      buildingId: building.id,
      position: { x: buildingStartX, y: 0, z: 0 },
      size: { x: buildingWidth, y: buildingHeight, z: buildingDepth },
      entranceCount: totalEntrances,
      floorCount: maxFloorNumber
    });

    // Add gap between buildings
    buildingOffsetX += gapBetweenEntrances;
  }

  return {
    layoutType: 'linear',
    apartments,
    envelopes
  };
}
