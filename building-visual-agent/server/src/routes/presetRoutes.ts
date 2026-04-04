import { Router } from 'express';
import { loadPreset, savePreset } from '../services/presets/presetStore.js';

export const presetRouter = Router();

presetRouter.get('/:projectId', (req, res) => {
  const preset = loadPreset(req.params.projectId);
  if (!preset) {
    res.status(404).json({ message: 'Preset not found' });
    return;
  }
  res.json(preset);
});

presetRouter.post('/', (req, res) => {
  const saved = savePreset(req.body);
  res.json(saved);
});
