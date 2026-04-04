import { useState } from 'react';
import type { FacadeMapping } from '../../types/scene';

interface Props {
  mappings: FacadeMapping[];
  onMappingsChange: (mappings: FacadeMapping[]) => void;
  onSavePreset: () => void;
  presetSaving?: boolean;
  presetStatus?: string | null;
}

export function FacadeEditor({
  mappings,
  onMappingsChange,
  onSavePreset,
  presetSaving,
  presetStatus,
}: Props) {
  const [expandedFace, setExpandedFace] = useState<string | null>(null);

  const updateUv = (
    faceIndex: number,
    key: keyof FacadeMapping['uv'],
    value: number
  ) => {
    const next = mappings.map((m, i) =>
      i === faceIndex ? { ...m, uv: { ...m.uv, [key]: value } } : m
    );
    onMappingsChange(next);
  };

  return (
    <div style={{ padding: 16, border: '1px solid #e3e8ef', borderRadius: 12, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Facade Editor</h3>
        <button
          onClick={onSavePreset}
          disabled={presetSaving || mappings.length === 0}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: 'none',
            background: presetSaving ? '#ccc' : '#1976d2',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: presetSaving ? 'default' : 'pointer',
          }}
        >
          {presetSaving ? 'Saving...' : 'Save Preset'}
        </button>
      </div>

      {presetStatus && (
        <div
          style={{
            padding: '6px 10px',
            marginBottom: 10,
            borderRadius: 6,
            fontSize: 12,
            background: presetStatus.startsWith('Error') ? '#fce4ec' : '#e8f5e9',
            color: presetStatus.startsWith('Error') ? '#c62828' : '#2e7d32',
          }}
        >
          {presetStatus}
        </div>
      )}

      {mappings.length === 0 && (
        <div style={{ color: '#667', fontSize: 14 }}>No facade mappings available.</div>
      )}

      {mappings.map((mapping, index) => {
        const isExpanded = expandedFace === mapping.face;
        return (
          <div
            key={mapping.face}
            style={{
              marginBottom: 8,
              padding: 12,
              background: '#f7f9fb',
              borderRadius: 8,
              border: '1px solid #e3e8ef',
            }}
          >
            {/* Header row */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpandedFace(isExpanded ? null : mapping.face)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ textTransform: 'uppercase', fontSize: 13 }}>{mapping.face}</strong>
                <ConfidenceBadge confidence={mapping.confidence} />
              </div>
              <span style={{ fontSize: 12, color: '#999' }}>{isExpanded ? 'collapse' : 'expand'}</span>
            </div>

            {/* Controls */}
            {isExpanded && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <UvSlider label="Offset X" value={mapping.uv.offsetX} min={-2} max={2} step={0.01}
                  onChange={(v) => updateUv(index, 'offsetX', v)} />
                <UvSlider label="Offset Y" value={mapping.uv.offsetY} min={-2} max={2} step={0.01}
                  onChange={(v) => updateUv(index, 'offsetY', v)} />
                <UvSlider label="Repeat X" value={mapping.uv.repeatX} min={0.1} max={5} step={0.05}
                  onChange={(v) => updateUv(index, 'repeatX', v)} />
                <UvSlider label="Repeat Y" value={mapping.uv.repeatY} min={0.1} max={5} step={0.05}
                  onChange={(v) => updateUv(index, 'repeatY', v)} />
                <UvSlider label="Rotation" value={mapping.uv.rotation} min={-180} max={180} step={1}
                  onChange={(v) => updateUv(index, 'rotation', v)} />
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                  Image: {mapping.image.split('/').pop()}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UvSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#556', width: 62, flexShrink: 0 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, height: 4, cursor: 'pointer' }}
      />
      <span style={{ fontSize: 12, fontFamily: 'monospace', width: 48, textAlign: 'right' }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const isLow = confidence < 0.9;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 600,
        background: isLow ? '#fff3e0' : '#e8f5e9',
        color: isLow ? '#e65100' : '#2e7d32',
      }}
    >
      {pct}%{isLow ? ' — review' : ''}
    </span>
  );
}
