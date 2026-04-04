import { useState } from 'react';
import { Toolbar } from '../components/Toolbar/Toolbar';
import { BuildingViewer } from '../components/BuildingViewer/BuildingViewer';
import { ApartmentPanel } from '../components/ApartmentPanel/ApartmentPanel';
import { FacadeEditor } from '../components/FacadeEditor/FacadeEditor';
import { PipelineStepper } from '../components/PipelineStepper/PipelineStepper';
import { generateScene, loadPreset, savePreset } from '../lib/api';
import type { StateTransition } from '../lib/api';
import type { SceneSpec, FacadeMapping } from '../types/scene';

import sampleProject from '../../../assets/sample-project/project.json';

export function App() {
  const [sceneSpec, setSceneSpec] = useState<SceneSpec | null>(null);
  const [facadeMappings, setFacadeMappings] = useState<FacadeMapping[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [presetSaving, setPresetSaving] = useState(false);
  const [presetStatus, setPresetStatus] = useState<string | null>(null);

  // Pipeline state tracking
  const [pipelineState, setPipelineState] = useState<string | null>(null);
  const [pipelineTransitions, setPipelineTransitions] = useState<StateTransition[]>([]);
  const [needsReview, setNeedsReview] = useState(false);

  const handleLoadSample = async () => {
    try {
      setError(null);
      setLoading(true);
      setPresetStatus(null);
      setPipelineState(null);
      setPipelineTransitions([]);

      const result = await generateScene(sampleProject);

      setPipelineState(result.state);
      setPipelineTransitions(result.transitions);
      setNeedsReview(result.needsReview);

      // Try loading a saved preset for this project
      const preset = await loadPreset(result.scene.project.id).catch(() => null);
      const mappings = preset?.mappings ?? result.scene.facades;

      setSceneSpec({ ...result.scene, facades: mappings });
      setFacadeMappings(mappings);

      const highlighted = result.scene.apartments.find((item) => item.highlighted);
      setSelectedApartmentId(highlighted?.meta.apartmentId ?? null);

      // Move to INTERACTIVE_VIEW once rendered
      setPipelineState('INTERACTIVE_VIEW');
      setPipelineTransitions((prev) => [
        ...prev,
        { from: 'RENDER_READY', to: 'INTERACTIVE_VIEW', timestamp: Date.now() },
      ]);

      if (preset) {
        setPresetStatus('Loaded saved preset');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample');
      setPipelineState('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingsChange = (mappings: FacadeMapping[]) => {
    setFacadeMappings(mappings);
    setPresetStatus(null);
  };

  const handleSavePreset = async () => {
    if (!sceneSpec) return;
    try {
      setPresetSaving(true);
      setPresetStatus(null);
      await savePreset(sceneSpec.project.id, facadeMappings);
      setPresetStatus('Preset saved successfully');
    } catch (err) {
      setPresetStatus(`Error: ${err instanceof Error ? err.message : 'Save failed'}`);
    } finally {
      setPresetSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 24, background: '#f2f5f8', minHeight: '100vh' }}>
      <h1 style={{ marginTop: 0 }}>Building Visual Agent</h1>
      <Toolbar onLoadSample={handleLoadSample} />

      <PipelineStepper
        currentState={pipelineState}
        transitions={pipelineTransitions}
        needsReview={needsReview}
      />

      {error && (
        <div style={{ color: '#b00020', marginBottom: 12, padding: '8px 12px', background: '#fce4ec', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: '#e3f2fd', borderRadius: 6, color: '#1565c0' }}>
          Generating scene...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', padding: 12, borderRadius: 12, border: '1px solid #e3e8ef' }}>
          <BuildingViewer
            sceneSpec={sceneSpec}
            selectedApartmentId={selectedApartmentId}
            facadeMappings={facadeMappings}
            onSelectApartment={setSelectedApartmentId}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ApartmentPanel sceneSpec={sceneSpec} selectedApartmentId={selectedApartmentId} />
          <FacadeEditor
            mappings={facadeMappings}
            onMappingsChange={handleMappingsChange}
            onSavePreset={handleSavePreset}
            presetSaving={presetSaving}
            presetStatus={presetStatus}
          />
        </div>
      </div>
    </div>
  );
}
