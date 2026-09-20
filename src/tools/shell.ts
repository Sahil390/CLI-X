import execa from 'execa';
import { ToolError } from '../utils/errors';

// ============================================================
// CLI-X — Shell Tool
// Safe subprocess runner wrapping execa.
// ============================================================

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
}

export interface ShellOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  /** If true, streams stdout/stderr to the parent process in real-time. */
  stream?: boolean;
}

export const ShellTool = {
  /**
   * Runs a command and returns the result.
   * Throws ToolError if the process exits with non-zero code.
   */
  async run(
    cmd: string,
    args: string[] = [],
    options: ShellOptions = {}
  ): Promise<ShellResult> {
    const { cwd = process.cwd(), env, timeout = 60_000, stream = false } = options;
    const command = `${cmd} ${args.join(' ')}`.trim();

    try {
      const proc = execa(cmd, args, {
        cwd,
        env: env ? { ...process.env, ...env } : undefined,
        timeout,
        reject: false,
        all: true,
      });

      if (stream) {
        proc.stdout?.pipe(process.stdout);
        proc.stderr?.pipe(process.stderr);
      }

      const result = await proc;

      return {
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        exitCode: result.exitCode ?? 1,
        command,
      };
    } catch (e) {
      throw new ToolError(`Shell command failed — ${command}: ${(e as Error).message}`);
    }
  },

  /**
   * Runs a command, asserting success (exitCode === 0).
   * Throws ToolError with captured stderr on failure.
   */
  async runOrThrow(
    cmd: string,
    args: string[] = [],
    options: ShellOptions = {}
  ): Promise<ShellResult> {
    const result = await ShellTool.run(cmd, args, options);
    if (result.exitCode !== 0) {
      throw new ToolError(
        `Command "${result.command}" exited with code ${result.exitCode}.\n${result.stderr || result.stdout}`
      );
    }
    return result;
  },

  /**
   * Checks whether a CLI tool is available on PATH.
   */
  async isAvailable(toolName: string): Promise<boolean> {
    try {
      const result = await ShellTool.run('which', [toolName]);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  },

  /**
   * Gets the installed version of a CLI tool (e.g. node, npm, git).
   * Returns null if the tool is not available.
   */
  async getVersion(tool: string, versionFlag = '--version'): Promise<string | null> {
    try {
      const result = await ShellTool.run(tool, [versionFlag]);
      if (result.exitCode === 0) {
        return result.stdout.trim().split('\n')[0];
      }
      return null;
    } catch {
      return null;
    }
  },
};
