import { ShellTool } from './shell';
import { BuildError, ValidationError } from '../utils/errors';

// ============================================================
// CLI-X — Validation Tool
// Runs build, type-check, lint, and test commands.
// ============================================================

export interface ValidationResult {
  success: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface ValidationIssue {
  file?: string;
  line?: number;
  column?: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning';
}

export const ValidationTool = {
  /**
   * Runs `npm run build` (or equivalent) in the given directory.
   */
  async runBuild(cwd: string): Promise<ValidationResult> {
    const start = Date.now();
    const result = await ShellTool.run('npm', ['run', 'build'], { cwd });

    const issues = ValidationTool.parseTscOutput(result.stderr + result.stdout);
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');

    return {
      success: result.exitCode === 0,
      errors,
      warnings,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - start,
    };
  },

  /**
   * Runs TypeScript type-check (`tsc --noEmit`).
   */
  async runTypeCheck(cwd: string): Promise<ValidationResult> {
    const start = Date.now();
    const result = await ShellTool.run('npx', ['tsc', '--noEmit'], { cwd });

    const issues = ValidationTool.parseTscOutput(result.stdout + result.stderr);
    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');

    return {
      success: result.exitCode === 0,
      errors,
      warnings,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - start,
    };
  },

  /**
   * Runs ESLint if a config file is present.
   */
  async runLint(cwd: string): Promise<ValidationResult> {
    const start = Date.now();
    const result = await ShellTool.run('npx', ['eslint', 'src', '--ext', '.ts,.tsx', '--format', 'compact'], { cwd });

    return {
      success: result.exitCode === 0,
      errors: [],
      warnings: [],
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - start,
    };
  },

  /**
   * Runs tests (`npm test`).
   */
  async runTests(cwd: string): Promise<ValidationResult> {
    const start = Date.now();
    const result = await ShellTool.run('npm', ['test', '--', '--passWithNoTests'], { cwd });

    return {
      success: result.exitCode === 0,
      errors: [],
      warnings: [],
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: Date.now() - start,
    };
  },

  /**
   * Parses TypeScript compiler output into structured issues.
   * Handles format: "file.ts(line,col): error TS1234: message"
   */
  parseTscOutput(output: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lines = output.split('\n');
    const tscPattern = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/;

    for (const line of lines) {
      const match = tscPattern.exec(line.trim());
      if (match) {
        issues.push({
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
          severity: match[4] as 'error' | 'warning',
          code: match[5],
          message: match[6],
        });
      }
    }

    return issues;
  },
};
