import { ValidationTool, ValidationResult } from '../tools/validation';
import { ui } from '../cli/ui/logger';

// ============================================================
// CLI-X — Test Runner
// Runs the project's test suite.
// ============================================================

export class TestRunner {
  async test(projectRoot: string): Promise<ValidationResult> {
    ui.info('Running test suite...');
    const result = await ValidationTool.runTests(projectRoot);

    if (result.success) {
      ui.success('All tests passed');
    } else {
      ui.error('Tests failed');
    }

    return result;
  }
}
