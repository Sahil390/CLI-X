import { ShellTool } from './shell';
import { ToolError } from '../utils/errors';

// ============================================================
// CLI-X — Git Tool
// Wrapper for common Git operations in project directories.
// ============================================================

export interface GitStatus {
  branch: string;
  modified: string[];
  untracked: string[];
  staged: string[];
  isClean: boolean;
}

export const GitTool = {
  /**
   * Initializes a new Git repository.
   */
  async init(cwd: string): Promise<void> {
    const result = await ShellTool.run('git', ['init'], { cwd });
    if (result.exitCode !== 0) {
      throw new ToolError(`git init failed in ${cwd}: ${result.stderr}`);
    }
  },

  /**
   * Returns the current branch name.
   */
  async currentBranch(cwd: string): Promise<string> {
    const result = await ShellTool.run('git', ['branch', '--show-current'], { cwd });
    if (result.exitCode !== 0) return 'unknown';
    return result.stdout.trim() || 'main';
  },

  /**
   * Returns the Git status for the working tree.
   */
  async status(cwd: string): Promise<GitStatus> {
    const result = await ShellTool.run('git', ['status', '--porcelain=v1', '-b'], { cwd });
    if (result.exitCode !== 0) {
      return { branch: 'unknown', modified: [], untracked: [], staged: [], isClean: false };
    }

    const lines = result.stdout.split('\n').filter(Boolean);
    const branch = lines[0]?.replace('## ', '').split('...')[0] ?? 'unknown';
    const modified: string[] = [];
    const untracked: string[] = [];
    const staged: string[] = [];

    for (const line of lines.slice(1)) {
      const xy = line.slice(0, 2);
      const file = line.slice(3).trim();
      if (xy[0] !== ' ' && xy[0] !== '?') staged.push(file);
      if (xy[1] === 'M') modified.push(file);
      if (xy === '??') untracked.push(file);
    }

    return {
      branch,
      modified,
      untracked,
      staged,
      isClean: modified.length === 0 && untracked.length === 0 && staged.length === 0,
    };
  },

  /**
   * Stages all changes.
   */
  async addAll(cwd: string): Promise<void> {
    await ShellTool.runOrThrow('git', ['add', '-A'], { cwd });
  },

  /**
   * Commits staged changes with the given message.
   */
  async commit(message: string, cwd: string): Promise<void> {
    const result = await ShellTool.run('git', ['commit', '-m', message], { cwd });
    if (result.exitCode !== 0) {
      // Allow "nothing to commit" without throwing
      if (result.stdout.includes('nothing to commit')) return;
      throw new ToolError(`git commit failed: ${result.stderr}`);
    }
  },

  /**
   * Checks whether Git is available on this system.
   */
  async isAvailable(): Promise<boolean> {
    return ShellTool.isAvailable('git');
  },

  /**
   * Returns the Git version string.
   */
  async version(): Promise<string | null> {
    return ShellTool.getVersion('git');
  },
};
