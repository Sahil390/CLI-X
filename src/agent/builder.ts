import { FilesystemTool } from '../tools/filesystem';
import { NotImplementedError } from '../utils/errors';
import type { PlanFile } from './planner';

// ============================================================
// CLI-X — Builder Sub-Agent
// Generates and writes file content based on the plan.
// ============================================================

export interface BuildResult {
  filesWritten: string[];
  errors: string[];
}

export class Builder {
  /**
   * Executes a plan by generating content for each file.
   * Mock implementation for local dev — Step 5 wires real LLM.
   */
  async execute(files: PlanFile[], projectRoot: string): Promise<BuildResult> {
    const written: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        if (file.action === 'delete') {
          await FilesystemTool.deleteFile(`${projectRoot}/${file.path}`);
        } else {
          // Placeholder — real generation happens in Step 5
          written.push(file.path);
        }
      } catch (e) {
        errors.push(`${file.path}: ${(e as Error).message}`);
      }
    }

    return { filesWritten: written, errors };
  }
}
