import { ValidationTool, ValidationResult } from '../tools/validation';
import { ui } from '../cli/ui/logger';

// ============================================================
// CLI-X — Lint Runner
// Runs ESLint on the project source.
// ============================================================

export class LintRunner {
  async lint(projectRoot: string): Promise<ValidationResult> {
    ui.info('Running ESLint...');
    const result = await ValidationTool.runLint(projectRoot);

    if (result.success) {
      ui.success('Lint passed — 0 warnings');
    } else {
      ui.warning(`Lint issues found`);
    }

    return result;
  }
}
