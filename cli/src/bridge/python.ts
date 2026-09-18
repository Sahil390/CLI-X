import { execa } from 'execa';
import { expandHomePath } from '../utils/fs.js';
import { log } from '../ui/logger.js';

export interface PythonCallOptions {
  modulePath: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

export interface PythonCallResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  stderr?: string;
}

export async function callPython(options: PythonCallOptions): Promise<PythonCallResult> {
  const { modulePath, args = [], cwd, timeout = 30000, env = {} } = options;
  const pythonPath = process.env.WB_PYTHON || 'python3';
  const projectRoot = process.cwd();
  const fullCwd = cwd ? expandHomePath(cwd) : projectRoot;

  log.dim(`  Python: ${pythonPath} -m ${modulePath} ${args.join(' ')}`);

  try {
    const result = await execa(pythonPath, ['-m', modulePath, ...args], {
      cwd: fullCwd,
      timeout,
      env: { ...process.env, ...env },
      reject: false,
    });

    if (result.stdout) {
      try {
        const parsed = JSON.parse(result.stdout.trim());
        return {
          success: true,
          data: parsed,
        };
      } catch {
        return {
          success: true,
          data: { raw: result.stdout.trim() },
        };
      }
    }

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || result.stdout || 'Unknown Python error',
        stderr: result.stderr,
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to execute Python',
    };
  }
}

export async function callPythonScript(scriptPath: string, args: string[] = []): Promise<PythonCallResult> {
  const pythonPath = process.env.WB_PYTHON || 'python3';
  const fullPath = expandHomePath(scriptPath);

  try {
    const result = await execa(pythonPath, [fullPath, ...args], {
      cwd: process.cwd(),
      timeout: 30000,
      reject: false,
    });

    if (result.stdout) {
      try {
        const parsed = JSON.parse(result.stdout.trim());
        return { success: true, data: parsed };
      } catch {
        return { success: true, data: { raw: result.stdout.trim() } };
      }
    }

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || result.stdout || 'Unknown Python error',
      };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
