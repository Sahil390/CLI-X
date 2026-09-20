import type { ValidationResult } from '../tools/validation';

// ============================================================
// CLI-X — Reviewer Sub-Agent
// Reviews build results and approves or flags issues.
// ============================================================

export interface ReviewResult {
  approved: boolean;
  issues: ReviewIssue[];
  suggestedFix?: string;
}

export interface ReviewIssue {
  file?: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

export class Reviewer {
  /**
   * Reviews a ValidationResult and produces a ReviewResult.
   * Maps build errors into structured review issues.
   */
  review(validationResult: ValidationResult): ReviewResult {
    const issues: ReviewIssue[] = [
      ...validationResult.errors.map((e) => ({
        file: e.file,
        line: e.line,
        message: e.message,
        severity: 'error' as const,
      })),
      ...validationResult.warnings.map((w) => ({
        file: w.file,
        line: w.line,
        message: w.message,
        severity: 'warning' as const,
      })),
    ];

    return {
      approved: validationResult.success,
      issues,
      suggestedFix: issues.length > 0
        ? `Review ${issues.length} issue(s) in the build output above.`
        : undefined,
    };
  }
}
