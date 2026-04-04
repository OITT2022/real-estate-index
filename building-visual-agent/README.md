# Building Visual Agent

Starter kit for a standalone **project structure to 3D visual building agent** built with:

- **React** (client UI)
- **Node.js + Express** (server API)
- **Three.js** (3D scene rendering)

The agent receives:
- project images
- building / entrance / floor / apartment hierarchy
- apartment metadata (unit number, rooms, area)
- selected apartment id

It generates:
- a procedural building scene
- facade texture mappings
- apartment coordinates and metadata
- viewer-ready scene JSON

## Main flows

1. Upload / send project JSON + images
2. Normalize input data
3. Infer layout
4. Auto-map images to facades
5. Review / adjust facade mappings
6. Save preset
7. Render interactive building viewer

## Project structure

- `client/` React + Three.js UI
- `server/` Node API + agent pipeline
- `shared/` shared schemas and types
- `agents/` Claude-oriented prompts and role files
- `assets/sample-project/` sample input JSON
- `instruction.txt` step-by-step setup guide
- `CLAUDE.md` guidance for Claude in VS Code

See `instruction.txt` to run the project.
