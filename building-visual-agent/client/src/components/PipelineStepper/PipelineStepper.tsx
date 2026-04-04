import type { StateTransition } from '../../lib/api';

interface Props {
  currentState: string | null;
  transitions: StateTransition[];
  needsReview?: boolean;
}

const PIPELINE_STEPS = [
  { key: 'INGEST', label: 'Ingest' },
  { key: 'NORMALIZE', label: 'Normalize' },
  { key: 'LAYOUT', label: 'Layout' },
  { key: 'AUTO_MAP', label: 'Auto-Map' },
  { key: 'REVIEW', label: 'Review' },
  { key: 'RENDER_READY', label: 'Render' },
];

const STEP_COLORS = {
  completed: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  current: { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
  pending: { bg: '#f5f5f5', text: '#bdbdbd', border: '#e0e0e0' },
  skipped: { bg: '#f5f5f5', text: '#bdbdbd', border: '#e0e0e0' },
  error: { bg: '#fce4ec', text: '#c62828', border: '#ef9a9a' },
};

export function PipelineStepper({ currentState, transitions, needsReview }: Props) {
  if (!currentState) return null;

  const visitedStates = new Set(transitions.map((t) => t.to));

  const getStepStatus = (stepKey: string): keyof typeof STEP_COLORS => {
    if (currentState === 'ERROR') {
      if (visitedStates.has(stepKey)) return 'completed';
      return 'error';
    }
    if (stepKey === currentState) return 'current';
    if (visitedStates.has(stepKey)) return 'completed';
    // REVIEW is optional — show as skipped if not visited and pipeline passed it
    if (stepKey === 'REVIEW' && !needsReview && visitedStates.has('RENDER_READY')) return 'skipped';
    return 'pending';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
      {PIPELINE_STEPS.map((step, i) => {
        const status = getStepStatus(step.key);
        const colors = STEP_COLORS[status];
        const isReviewOptional = step.key === 'REVIEW' && !needsReview;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                padding: '4px 12px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: status === 'current' ? 700 : 500,
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                opacity: isReviewOptional && status === 'skipped' ? 0.5 : 1,
              }}
            >
              {status === 'completed' && '\u2713 '}
              {step.label}
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{ width: 16, height: 1, background: '#ccc', margin: '0 2px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
