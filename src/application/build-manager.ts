import { ValidationTool, ValidationResult } from '../tools/validation';
import { BuildError } from '../utils/errors';

// ============================================================
// CLI-X — Build Manager (Application Layer)
// Coordinates build validation and reporting.
// ============================================================

export type { ValidationResult };

export class BuildManager {
  /**
   * Runs a full build for the given project directory.
   */
  async build(projectRoot: string): Promise<ValidationResult> {
    return ValidationTool.runBuild(projectRoot);
  }

  /**
   * Runs TypeScript type-check without emitting files.
   */
  async typeCheck(projectRoot: string): Promise<ValidationResult> {
    return ValidationTool.runTypeCheck(projectRoot);
  }

  /**
   * Runs linting.
   */
  async lint(projectRoot: string): Promise<ValidationResult> {
    return ValidationTool.runLint(projectRoot);
  }

  /**
   * Runs tests.
   */
  async test(projectRoot: string): Promise<ValidationResult> {
    return ValidationTool.runTests(projectRoot);
  }

  /**
   * Runs the full validation suite: build → typeCheck → lint → test
   * Returns the first failed result, or the last result if all pass.
   */
  async validate(projectRoot: string): Promise<ValidationResult> {
    const build = await this.build(projectRoot);
    if (!build.success) return build;

    const typeCheck = await this.typeCheck(projectRoot);
    if (!typeCheck.success) return typeCheck;

    return typeCheck;
  }
}
