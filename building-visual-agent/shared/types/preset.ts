import type { FacadeMapping } from './scene';

export interface FacadePreset {
  presetId: string;
  projectId: string;
  layoutType: string;
  mappings: FacadeMapping[];
  createdAt: string;
  updatedAt: string;
}
