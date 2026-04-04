import { Router } from 'express';
import { normalizeProject } from '../services/normalize/normalizeProject.js';
import { generateLayout } from '../services/layout/generateLayout.js';
import { autoMapFacades } from '../services/mapping/autoMapFacades.js';
import { buildSceneSpec } from '../services/layout/buildSceneSpec.js';
import { PipelineStateMachine } from '../services/agent/stateMachine.js';

export const projectRouter = Router();

projectRouter.post('/scene', (req, res) => {
  const pipeline = new PipelineStateMachine();

  try {
    pipeline.transition('INGEST');

    pipeline.transition('NORMALIZE');
    const normalized = normalizeProject(req.body);

    pipeline.transition('LAYOUT');
    const layout = generateLayout(normalized);

    pipeline.transition('AUTO_MAP');
    const facadeMappings = autoMapFacades(normalized);

    // If any facade has low confidence, pass through REVIEW
    const needsReview = facadeMappings.some((m) => m.confidence < 0.9);
    if (needsReview) {
      pipeline.transition('REVIEW');
    }

    pipeline.transition('RENDER_READY');
    const scene = buildSceneSpec(normalized, layout, facadeMappings);

    res.json({
      state: pipeline.state,
      transitions: pipeline.history,
      needsReview,
      scene,
    });
  } catch (error) {
    pipeline.fail(error instanceof Error ? error.message : 'Unknown error');
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      state: pipeline.state,
      transitions: pipeline.history,
      error: message,
    });
  }
});
