import type { SceneSpec, FacadeMapping } from '../types/scene';

const API_BASE = 'http://localhost:4000/api';

export interface StateTransition {
  from: string;
  to: string;
  timestamp: number;
}

export interface SceneResponse {
  state: string;
  transitions: StateTransition[];
  needsReview: boolean;
  scene: SceneSpec;
}

export async function generateScene(payload: unknown): Promise<SceneResponse> {
  const response = await fetch(`${API_BASE}/projects/scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Failed to generate scene');
  }

  return response.json();
}

export interface FacadePreset {
  presetId: string;
  projectId: string;
  layoutType: string;
  mappings: FacadeMapping[];
  createdAt: string;
  updatedAt: string;
}

export async function loadPreset(projectId: string): Promise<FacadePreset | null> {
  const response = await fetch(`${API_BASE}/presets/${encodeURIComponent(projectId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to load preset');
  return response.json();
}

export async function savePreset(
  projectId: string,
  mappings: FacadeMapping[]
): Promise<FacadePreset> {
  const response = await fetch(`${API_BASE}/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, layoutType: 'linear', mappings })
  });
  if (!response.ok) throw new Error('Failed to save preset');
  return response.json();
}
