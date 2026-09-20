import * as path from 'path';
import { ProjectStateTool, AiStateFile } from '../tools/project-state';
import type {
  ProjectState,
  ArchitectureState,
  DesignState,
  DecisionsState,
  HistoryState,
  HistoryEvent,
} from './state';

// ============================================================
// CLI-X — Project Memory
// Manages persistent .ai/ state with typed read/write helpers.
// ============================================================

export class ProjectMemory {
  constructor(private readonly projectRoot: string) {}

  /** Initializes the .ai/ directory structure for a new project. */
  async initialize(): Promise<void> {
    await ProjectStateTool.initialize(this.projectRoot);
  }

  /** Returns true if the .ai/ directory exists. */
  exists(): boolean {
    const { FilesystemTool } = require('../tools/filesystem');
    return FilesystemTool.exists(ProjectStateTool.aiDir(this.projectRoot));
  }

  // ── Project ──────────────────────────────────────────────

  async readProject(): Promise<ProjectState | null> {
    return ProjectStateTool.read<ProjectState>(this.projectRoot, 'project.json');
  }

  async writeProject(data: Partial<ProjectState>): Promise<void> {
    await ProjectStateTool.merge(this.projectRoot, 'project.json', data as Record<string, unknown>);
  }

  // ── Architecture ─────────────────────────────────────────

  async readArchitecture(): Promise<ArchitectureState | null> {
    return ProjectStateTool.read<ArchitectureState>(this.projectRoot, 'architecture.json');
  }

  async writeArchitecture(data: Partial<ArchitectureState>): Promise<void> {
    await ProjectStateTool.merge(this.projectRoot, 'architecture.json', data as Record<string, unknown>);
  }

  // ── Design ───────────────────────────────────────────────

  async readDesign(): Promise<DesignState | null> {
    return ProjectStateTool.read<DesignState>(this.projectRoot, 'design.json');
  }

  async writeDesign(data: Partial<DesignState>): Promise<void> {
    await ProjectStateTool.merge(this.projectRoot, 'design.json', data as Record<string, unknown>);
  }

  // ── Decisions ────────────────────────────────────────────

  async readDecisions(): Promise<DecisionsState | null> {
    return ProjectStateTool.read<DecisionsState>(this.projectRoot, 'decisions.json');
  }

  async addDecision(decision: Omit<DecisionsState['decisions'][0], 'id' | 'timestamp'>): Promise<void> {
    const existing = (await this.readDecisions()) ?? { decisions: [] };
    const newDecision = {
      id: `d${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...decision,
    };
    await ProjectStateTool.write(this.projectRoot, 'decisions.json', {
      decisions: [...existing.decisions, newDecision],
    });
  }

  // ── History ──────────────────────────────────────────────

  async readHistory(): Promise<HistoryState | null> {
    return ProjectStateTool.read<HistoryState>(this.projectRoot, 'history.json');
  }

  async addHistoryEvent(event: Omit<HistoryEvent, 'timestamp'>): Promise<void> {
    const existing = (await this.readHistory()) ?? { events: [] };
    const newEvent: HistoryEvent = {
      timestamp: new Date().toISOString(),
      ...event,
    };
    await ProjectStateTool.write(this.projectRoot, 'history.json', {
      events: [...existing.events.slice(-99), newEvent], // Keep last 100 events
    });
  }
}
