import { ValidationTool, ValidationResult } from '../tools/validation';
import { ui } from '../cli/ui/logger';

// ============================================================
// CLI-X — Type Checker
// Runs tsc --noEmit and parses structured errors.
// ============================================================

export class TypeChecker {
  async check(projectRoot: string): Promise<ValidationResult> {
    ui.info('Running TypeScript type check...');
    const result = await ValidationTool.runTypeCheck(projectRoot);

    if (result.success) {
      ui.success('Type check passed — 0 errors');
    } else {
      ui.error(`Type check failed — ${result.errors.length} error(s)`);
      result.errors.slice(0, 5).forEach((e) => {
        ui.error(`  ${e.file ?? '?'}(${e.line},${e.column}) ${e.code}: ${e.message}`);
      });
    }

    return result;
  }
}
