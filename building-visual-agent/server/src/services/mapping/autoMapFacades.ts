import type { ProjectInput, FacadeName } from '../../../../shared/types/project';
import type { FacadeMapping } from '../../../../shared/types/scene';

const faces: FacadeName[] = ['front', 'left', 'right', 'back'];

export function autoMapFacades(project: ProjectInput): FacadeMapping[] {
  return faces
    .filter((face) => project.project.images[face])
    .map((face) => ({
      face,
      image: project.project.images[face] as string,
      confidence: face === 'front' ? 0.92 : 0.85,
      uv: {
        offsetX: 0,
        offsetY: 0,
        repeatX: 1,
        repeatY: 1,
        rotation: 0
      }
    }));
}
