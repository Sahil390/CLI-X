import { Planner } from './planner';
import { Builder } from './builder';
import { Reviewer } from './reviewer';
import { AgentRepairLoop } from './repair-loop';
import { ContextAssembler } from './context';
import { ProjectMemory } from '../project/project-memory';
import { NotImplementedError } from '../utils/errors';
import { ui } from '../cli/ui/logger';

// ============================================================
// CLI-X — Website Agent
// Orchestrates the full understand → plan → act → validate cycle.
// Layer 3 of the CLI-X architecture (Strands boundary).
// ============================================================

export interface AgentRunOptions {
  projectRoot: string;
  userRequest: string;
  runValidation?: boolean;
}

export interface AgentRunResult {
  success: boolean;
  summary: string;
  filesChanged: string[];
  repairIterations: number;
}

export class WebsiteAgent {
  private readonly planner = new Planner();
  private readonly builder = new Builder();
  private readonly reviewer = new Reviewer();
  private readonly repairLoop = new AgentRepairLoop();

  /**
   * Main agent entry point.
   * Runs the full observe → plan → act → validate → repair cycle.
   */
  async run(options: AgentRunOptions): Promise<AgentRunResult> {
    const { projectRoot, userRequest, runValidation = false } = options;

    ui.info('Assembling project context...');
    const assembler = new ContextAssembler(projectRoot);
    const context = await assembler.assemble();

    ui.info(`Understanding request: "${userRequest}"`);
    const plan = await this.planner.plan(
      userRequest,
      JSON.stringify(context, null, 2)
    );

    ui.info(`Plan: ${plan.summary}`);
    ui.info(`Files to process: ${plan.files.length}`);

    const buildResult = await this.builder.execute(plan.files, projectRoot);

    if (buildResult.errors.length > 0) {
      buildResult.errors.forEach((e) => ui.error(e));
    }

    let repairIterations = 0;
    if (runValidation && buildResult.filesWritten.length > 0) {
      const repairResult = await this.repairLoop.run(projectRoot);
      repairIterations = repairResult.iterations;
    }

    // Log to project memory
    const memory = new ProjectMemory(projectRoot);
    if (memory.exists()) {
      await memory.addHistoryEvent({
        type: 'edit',
        description: `Agent: ${userRequest}`,
        metadata: { filesChanged: buildResult.filesWritten, repairIterations },
      });
    }

    return {
      success: buildResult.errors.length === 0,
      summary: plan.summary,
      filesChanged: buildResult.filesWritten,
      repairIterations,
    };
  }

  /** Direct understand stub — raises NotImplementedError for Strands. */
  async understand(_prompt: string): Promise<string> {
    return `[CLI-X] Understanding: "${_prompt}". Full Strands integration deferred to Step 5.`;
  }

  /** Direct plan stub. */
  async plan(prompt: string): Promise<string> {
    const result = await this.planner.plan(prompt, '{}');
    return result.summary;
  }

  /** Direct act stub. */
  async act(_prompt: string): Promise<string> {
    throw new NotImplementedError('Strands agent execution (act)');
  }
}
