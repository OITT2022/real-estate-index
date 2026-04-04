# Claude Workspace Instructions

You are working on a standalone **Building Visual Agent**.

## Product goal
Generate a procedural visual building model from structured project data and project images.

## Source of truth
The source of truth is the database / input JSON, not an imported 3D model.

## Required capabilities
1. Normalize project input.
2. Generate building layout from buildings / entrances / floors / apartments.
3. Map uploaded facade images to the building.
4. Support auto-map and manual adjustment.
5. Save and load mapping presets.
6. Render an interactive Three.js viewer.

## Architectural rules
- Keep business logic in `server/`.
- Keep rendering logic in `client/`.
- Keep shared types in `shared/`.
- Avoid mixing domain logic into raw UI components.
- Build deterministic services.
- Treat apartment metadata as first-class data.

## Agent states
- IDLE
- INGEST
- NORMALIZE
- LAYOUT
- AUTO_MAP
- REVIEW
- ADJUST
- SAVE_PRESET
- RENDER_READY
- INTERACTIVE_VIEW
- ERROR

## Important project rules
- Each apartment must include unit number, rooms, and area.
- Project images must be part of the input JSON.
- selectedApartmentId should be highlighted in the viewer.
- Save facade mappings as presets.
- Build for maintainability, not just demo visuals.

## Suggested implementation order
1. Shared types and schemas
2. Normalize pipeline
3. Layout generation
4. Scene spec builder
5. Viewer rendering
6. Facade editor
7. Preset persistence
8. UI polish
