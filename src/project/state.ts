// ============================================================
// CLI-X — Project State Interfaces
// Typed shapes for all .ai/ state documents.
// ============================================================

export interface ProjectState {
  name: string;
  framework: string;
  language: string;
  description?: string;
  requirements?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ArchitectureState {
  layers: ArchitectureLayer[];
  dependencies: DependencyEntry[];
  entryPoints: string[];
  buildOutput?: string;
}

export interface ArchitectureLayer {
  name: string;
  path: string;
  responsibility: string;
  files: string[];
}

export interface DependencyEntry {
  name: string;
  version: string;
  type: 'runtime' | 'dev' | 'peer';
  purpose?: string;
}

export interface DesignState {
  theme: 'light' | 'dark' | 'system';
  colorScheme: string;
  typography: string;
  components: string[];
  designSystem?: string;
}

export interface DecisionEntry {
  id: string;
  decision: string;
  rationale: string;
  alternatives?: string[];
  timestamp: string;
}

export interface DecisionsState {
  decisions: DecisionEntry[];
}

export interface HistoryEvent {
  type: 'create' | 'edit' | 'build' | 'repair' | 'deploy' | 'chat';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface HistoryState {
  events: HistoryEvent[];
}
