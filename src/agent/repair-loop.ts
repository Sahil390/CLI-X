import { ValidationTool, ValidationResult } from '../tools/validation';
import { ui } from '../cli/ui/logger';
import { sleep } from '../utils/helpers';

// ============================================================
// CLI-X — Agent-Level Repair Loop
// Diagnose → Fix → Re-validate, capped at MAX_ITERATIONS.
// ============================================================

const MAX_ITERATIONS = 3;
const REPAIR_DELAY_MS = 500;

export interface RepairLoopResult {
  success: boolean;
  iterations: number;
  finalResult: ValidationResult;
  repairLog: RepairAttempt[];
}

export interface RepairAttempt {
  iteration: number;
  errors: string[];
  repairApplied: string;
  resultAfterRepair: boolean;
}

export class AgentRepairLoop {
  /**
   * Runs the self-repair loop for a project.
   *
   * Iteration flow:
   *   Build/Check → Pass → Complete
   *               → Fail → Diagnose → Apply Fix → Re-validate
   *
   * Capped at MAX_ITERATIONS (3) to prevent infinite loops.
   */
  async run(projectRoot: string): Promise<RepairLoopResult> {
    const repairLog: RepairAttempt[] = [];
    let lastResult: ValidationResult = await ValidationTool.runBuild(projectRoot);
    let iterations = 0;

    while (!lastResult.success && iterations < MAX_ITERATIONS) {
      iterations++;
      const errorMessages = lastResult.errors.map((e) => e.message);

      ui.info(`Inspecting error logs...`);
      await sleep(REPAIR_DELAY_MS);
      ui.info(`Analyzing ${lastResult.errors.length} error(s)...`);
      await sleep(REPAIR_DELAY_MS);

      // Mock repair step — Step 5 will wire real LLM-based repair
      const repairApplied = `[Iteration ${iterations}] Repair analysis complete. Manual fix required for: ${errorMessages[0] ?? 'unknown error'}`;
      ui.warning(repairApplied);

      // Re-validate after repair attempt
      lastResult = await ValidationTool.runBuild(projectRoot);

      repairLog.push({
        iteration: iterations,
        errors: errorMessages,
        repairApplied,
        resultAfterRepair: lastResult.success,
      });

      if (lastResult.success) {
        ui.success('Build clean after repair.');
        break;
      }
    }

    return {
      success: lastResult.success,
      iterations,
      finalResult: lastResult,
      repairLog,
    };
  }
}
