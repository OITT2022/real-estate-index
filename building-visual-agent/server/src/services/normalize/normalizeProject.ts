import type { ProjectInput } from '../../../../shared/types/project';

export function normalizeProject(input: unknown): ProjectInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Project payload must be an object');
  }

  const project = input as ProjectInput;

  if (!project.project?.id || !project.project?.name) {
    throw new Error('Missing project.id or project.name');
  }

  if (!Array.isArray(project.buildings) || project.buildings.length === 0) {
    throw new Error('At least one building is required');
  }

  const apartmentIds = new Set<string>();

  for (const building of project.buildings) {
    if (!building.id) throw new Error('Each building must have id');

    for (const entrance of building.entrances ?? []) {
      if (!entrance.id) throw new Error('Each entrance must have id');

      for (const floor of entrance.floors ?? []) {
        for (const apartment of floor.apartments ?? []) {
          if (!apartment.id) throw new Error('Each apartment must have id');
          if (apartmentIds.has(apartment.id)) {
            throw new Error(`Duplicate apartment id: ${apartment.id}`);
          }
          apartmentIds.add(apartment.id);

          if (!apartment.unitNumber) throw new Error(`Apartment ${apartment.id} missing unitNumber`);
          if (typeof apartment.rooms !== 'number') throw new Error(`Apartment ${apartment.id} missing rooms`);
          if (typeof apartment.areaSqm !== 'number') throw new Error(`Apartment ${apartment.id} missing areaSqm`);
        }
      }
    }
  }

  if (project.selectedApartmentId && !apartmentIds.has(project.selectedApartmentId)) {
    throw new Error('selectedApartmentId not found in apartments');
  }

  return {
    ...project,
    settings: {
      defaultApartmentWidth: project.settings?.defaultApartmentWidth ?? 3.2,
      floorHeight: project.settings?.floorHeight ?? 3,
      buildingDepth: project.settings?.buildingDepth ?? 8,
      gapBetweenEntrances: project.settings?.gapBetweenEntrances ?? 1.5
    }
  };
}
