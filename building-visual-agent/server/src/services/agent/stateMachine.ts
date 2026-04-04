import type { AgentState, StateTransition } from '../../../../shared/types/agent';

const VALID_TRANSITIONS: Record<AgentState, AgentState[]> = {
  IDLE:             ['INGEST', 'ERROR'],
  INGEST:           ['NORMALIZE', 'ERROR'],
  NORMALIZE:        ['LAYOUT', 'ERROR'],
  LAYOUT:           ['AUTO_MAP', 'ERROR'],
  AUTO_MAP:         ['REVIEW', 'RENDER_READY', 'ERROR'],
  REVIEW:           ['ADJUST', 'RENDER_READY', 'ERROR'],
  ADJUST:           ['SAVE_PRESET', 'RENDER_READY', 'ERROR'],
  SAVE_PRESET:      ['RENDER_READY', 'ERROR'],
  RENDER_READY:     ['INTERACTIVE_VIEW', 'IDLE', 'ERROR'],
  INTERACTIVE_VIEW: ['IDLE', 'ADJUST', 'ERROR'],
  ERROR:            ['IDLE'],
};

export class PipelineStateMachine {
  private current: AgentState = 'IDLE';
  private transitions: StateTransition[] = [];

  get state(): AgentState {
    return this.current;
  }

  get history(): StateTransition[] {
    return [...this.transitions];
  }

  transition(to: AgentState): void {
    const allowed = VALID_TRANSITIONS[this.current];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid state transition: ${this.current} → ${to}`);
    }
    this.transitions.push({
      from: this.current,
      to,
      timestamp: Date.now(),
    });
    this.current = to;
  }

  fail(error: string): void {
    this.transitions.push({
      from: this.current,
      to: 'ERROR',
      timestamp: Date.now(),
    });
    this.current = 'ERROR';
  }

  reset(): void {
    this.current = 'IDLE';
    this.transitions = [];
  }
}
