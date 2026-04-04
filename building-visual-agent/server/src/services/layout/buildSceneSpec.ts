import type { ProjectInput } from '../../../../shared/types/project';
import type { FacadeMapping, SceneSpec } from '../../../../shared/types/scene';
import type { LayoutResult } from './generateLayout.js';

export function buildSceneSpec(
  project: ProjectInput,
  layout: LayoutResult,
  facades: FacadeMapping[]
): SceneSpec {
  // Compute total bounds from all envelopes
  let maxX = 0;
  let maxY = 0;
  let maxZ = 0;

  for (const env of layout.envelopes) {
    maxX = Math.max(maxX, env.position.x + env.size.x);
    maxY = Math.max(maxY, env.position.y + env.size.y);
    maxZ = Math.max(maxZ, env.position.z + env.size.z);
  }

  // Fallback for empty layouts
  if (maxX === 0) maxX = 10;
  if (maxY === 0) maxY = 6;

  const diagonal = Math.sqrt(maxX * maxX + maxY * maxY + maxZ * maxZ);

  return {
    project: {
      id: project.project.id,
      name: project.project.name,
      location: project.project.location
    },
    camera: {
      target: { x: maxX / 2, y: maxY / 2, z: maxZ / 2 },
      distance: diagonal * 1.2,
      yaw: 0.6,
      pitch: 0.35
    },
    apartments: layout.apartments,
    envelopes: layout.envelopes.map((env) => ({
      buildingId: env.buildingId,
      position: env.position,
      size: env.size,
      entranceCount: env.entranceCount,
      floorCount: env.floorCount
    })),
    facades
  };
}
