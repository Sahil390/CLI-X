import ora, { Ora } from 'ora';
import { colors } from './colors';

// ============================================================
// CLI-X — Spinner Wrapper
// Ora-backed spinner with CLI-X brand styling.
// ============================================================

export interface SpinnerOptions {
  text: string;
  /** If true, prefixes the spinner text with ◆ (cyan). Default: true */
  prefixSymbol?: boolean;
}

export class Spinner {
  private readonly ora: Ora;

  constructor(options: SpinnerOptions | string) {
    const text = typeof options === 'string' ? options : options.text;
    const prefix = typeof options === 'string' || options.prefixSymbol !== false
      ? `${colors.boldCyan('◆')} `
      : '';

    this.ora = ora({
      text: `${prefix}${text}`,
      spinner: 'dots',
      color: 'cyan',
    });
  }

  /** Starts the spinner. */
  start(text?: string): this {
    if (text) {
      this.ora.text = `${colors.boldCyan('◆')} ${text}`;
    }
    this.ora.start();
    return this;
  }

  /** Updates the spinner text while running. */
  update(text: string): this {
    this.ora.text = `${colors.boldCyan('◆')} ${text}`;
    return this;
  }

  /** Stops the spinner with a ✓ success message. */
  succeed(text?: string): void {
    this.ora.succeed(text ? `${colors.boldGreen('✓')} ${text}` : undefined);
  }

  /** Stops the spinner with a ✕ error message. */
  fail(text?: string): void {
    this.ora.fail(text ? `${colors.boldRed('✕')} ${text}` : undefined);
  }

  /** Stops the spinner with a ★ warning message. */
  warn(text?: string): void {
    this.ora.warn(text ? `${colors.boldYellow('★')} ${text}` : undefined);
  }

  /** Stops the spinner without any symbol. */
  stop(): void {
    this.ora.stop();
  }
}

/**
 * Convenience function — runs an async task with a spinner.
 * Automatically succeeds or fails based on whether the task throws.
 */
export async function withSpinner<T>(
  text: string,
  task: (spinner: Spinner) => Promise<T>,
  successText?: string,
  failText?: string
): Promise<T> {
  const spinner = new Spinner(text);
  spinner.start();
  try {
    const result = await task(spinner);
    spinner.succeed(successText ?? text);
    return result;
  } catch (error) {
    spinner.fail(failText ?? `Failed: ${(error as Error).message}`);
    throw error;
  }
}
