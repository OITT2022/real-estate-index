import cors from 'cors';
import express from 'express';
import { projectRouter } from './routes/projectRoutes.js';
import { presetRouter } from './routes/presetRoutes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'building-visual-agent-server' });
});

app.use('/api/projects', projectRouter);
app.use('/api/presets', presetRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
