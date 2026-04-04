import fs from 'node:fs';
import path from 'node:path';
import type { FacadePreset } from '../../../../shared/types/preset';

const dataDir = path.resolve(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'presets.json');

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]', 'utf8');
}

function readAll(): FacadePreset[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8')) as FacadePreset[];
}

function writeAll(items: FacadePreset[]): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(items, null, 2), 'utf8');
}

export function savePreset(input: Partial<FacadePreset>): FacadePreset {
  const items = readAll();
  const now = new Date().toISOString();
  const preset: FacadePreset = {
    presetId: input.presetId ?? `preset-${input.projectId ?? 'unknown'}-${Date.now()}`,
    projectId: input.projectId ?? 'unknown',
    layoutType: input.layoutType ?? 'linear',
    mappings: input.mappings ?? [],
    createdAt: input.createdAt ?? now,
    updatedAt: now
  };

  const index = items.findIndex((x) => x.projectId === preset.projectId);
  if (index >= 0) items[index] = preset;
  else items.push(preset);
  writeAll(items);
  return preset;
}

export function loadPreset(projectId: string): FacadePreset | null {
  const items = readAll();
  return items.find((x) => x.projectId === projectId) ?? null;
}
