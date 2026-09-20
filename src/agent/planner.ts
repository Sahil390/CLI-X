import { ModelGateway } from '../models/model-gateway';
import { SystemPrompts } from './system-prompt';
import { NotImplementedError } from '../utils/errors';

// ============================================================
// CLI-X — Planner Sub-Agent
// Produces a structured plan from a user request.
// ============================================================

export interface PlanFile {
  path: string;
  action: 'create' | 'modify' | 'delete';
  reason: string;
}

export interface AgentPlan {
  summary: string;
  files: PlanFile[];
  risks: string[];
  complexity: 'low' | 'medium' | 'high';
}

export class Planner {
  private readonly gateway = new ModelGateway();

  /**
   * Produces a structured plan for the given request.
   * Currently returns a mock plan for local development.
   * Will use ModelGateway in Step 5.
   */
  async plan(userRequest: string, projectContext: string): Promise<AgentPlan> {
    // Mock plan for local development — Step 5 will wire real LLM call
    return {
      summary: `Processing: "${userRequest}"`,
      files: [],
      risks: [],
      complexity: 'low',
    };
  }
}
