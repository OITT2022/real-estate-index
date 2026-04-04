export type AgentState =
  | 'IDLE'
  | 'INGEST'
  | 'NORMALIZE'
  | 'LAYOUT'
  | 'AUTO_MAP'
  | 'REVIEW'
  | 'ADJUST'
  | 'SAVE_PRESET'
  | 'RENDER_READY'
  | 'INTERACTIVE_VIEW'
  | 'ERROR';

export interface StateTransition {
  from: AgentState;
  to: AgentState;
  timestamp: number;
}

export interface PipelineResult {
  state: AgentState;
  transitions: StateTransition[];
  error?: string;
}
