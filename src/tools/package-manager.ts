import { ShellTool } from './shell';
import { detectPackageManager } from '../utils/helpers';
import { ToolError } from '../utils/errors';

// ============================================================
// CLI-X — Package Manager Tool
// Detects npm/yarn/pnpm and wraps install/run operations.
// ============================================================

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm';

export interface InstallResult {
  packageManager: PackageManagerName;
  installed: string[];
  stdout: string;
  stderr: string;
}

export interface RunScriptResult {
  packageManager: PackageManagerName;
  script: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export const PackageManagerTool = {
  /**
   * Detects the package manager for the given project directory.
   */
  detect(cwd: string): PackageManagerName {
    return detectPackageManager(cwd);
  },

  /**
   * Installs all dependencies (npm install / yarn / pnpm install).
   */
  async install(cwd: string): Promise<InstallResult> {
    const pm = PackageManagerTool.detect(cwd);
    const args = pm === 'npm' ? ['install'] : pm === 'yarn' ? [] : ['install'];

    const result = await ShellTool.run(pm, args, { cwd, stream: true });

    if (result.exitCode !== 0) {
      throw new ToolError(`Package install failed in ${cwd}:\n${result.stderr}`);
    }

    return {
      packageManager: pm,
      installed: [],
      stdout: result.stdout,
      stderr: result.stderr,
    };
  },

  /**
   * Installs specific packages (npm install <packages> / yarn add / pnpm add).
   */
  async add(packages: string[], cwd: string, dev = false): Promise<InstallResult> {
    const pm = PackageManagerTool.detect(cwd);
    let cmd: string;
    let args: string[];

    switch (pm) {
      case 'yarn':
        cmd = 'yarn';
        args = ['add', ...(dev ? ['--dev'] : []), ...packages];
        break;
      case 'pnpm':
        cmd = 'pnpm';
        args = ['add', ...(dev ? ['--save-dev'] : []), ...packages];
        break;
      default:
        cmd = 'npm';
        args = ['install', ...(dev ? ['--save-dev'] : []), ...packages];
    }

    const result = await ShellTool.run(cmd, args, { cwd, stream: true });

    if (result.exitCode !== 0) {
      throw new ToolError(`Failed to add packages [${packages.join(', ')}] in ${cwd}:\n${result.stderr}`);
    }

    return {
      packageManager: pm,
      installed: packages,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  },

  /**
   * Runs an npm/yarn/pnpm script (e.g. "build", "dev", "test").
   */
  async runScript(
    scriptName: string,
    cwd: string,
    extraArgs: string[] = []
  ): Promise<RunScriptResult> {
    const pm = PackageManagerTool.detect(cwd);
    const args =
      pm === 'npm'
        ? ['run', scriptName, ...extraArgs]
        : [scriptName, ...extraArgs];

    const result = await ShellTool.run(pm, args, { cwd, stream: true });

    return {
      packageManager: pm,
      script: scriptName,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  },
};
