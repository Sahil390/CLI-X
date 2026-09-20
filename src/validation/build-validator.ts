import { ValidationTool, ValidationResult } from '../tools/validation';
import { ui } from '../cli/ui/logger';

// ============================================================
// CLI-X — Build Validator
// Runs the project build and reports structured results.
// ============================================================

export class BuildValidator {
  async validate(projectRoot: string): Promise<ValidationResult> {
    ui.info('Running build...');
    const result = await ValidationTool.runBuild(projectRoot);

    if (result.success) {
      ui.success(`Build succeeded in ${result.durationMs}ms`);
    } else {
      ui.error(`Build failed — ${result.errors.length} error(s)`);
      result.errors.slice(0, 5).forEach((e) => {
        ui.error(`  ${e.file ?? '?'}:${e.line ?? '?'} — ${e.message}`);
      });
    }

    return result;
  }
}
