import { execa } from 'execa';
import { existsSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { expandHomePath } from '../utils/fs.js';
import { log } from '../ui/logger.js';

function sanitizeArg(a: string): string {
  return a.replace(/[^A-Za-z0-9_\-\.\/:=@@]/g, '').trim();
}

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

function getPackageDir(): string {
  // Resolve from compiled dist/ file: __dirname is .../dist/bridge/ → parent = .../dist → parent = package root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // If running from src/ via ts-node, go up one extra; if from dist/ go up two to package root
  // We detect by checking if ../backend exists relative to __dirname
  const candidate = resolve(__dirname, '..', '..', '..', 'backend');
  const fromDist = resolve(__dirname, '../backend/backend/cli.py');
  if (existsSync(fromDist)) return candidate;
  // src/ case: __dirname = cli/src/bridge/ → go up 2 = cli/
  const srcCandidate = resolve(__dirname, '..', '..');
  if (existsSync(resolve(srcCandidate, '../backend/requirements.txt'))) return srcCandidate;
  return candidate;
}

function getPythonBin(): string {
  for (const cmd of ['python3', 'python']) {
    try {
      // Quick check by attempting version; we use execa with reject:false
      return cmd;
    } catch { /* continue */ }
  }
  return 'python3';
}

async function ensureVenv(packageDir: string, pythonCmd: string): Promise<void> {
  const venvDir = resolve(packageDir, '.venv');
  const reqFile = resolve(packageDir, 'backend', 'requirements.txt');
  if (!existsSync(reqFile)) {
    log.dim('  No backend/requirements.txt found; skipping venv setup.');
    return;
  }
  if (!existsSync(venvDir)) {
    log.dim(`  Creating .venv at ${venvDir} ...`);
    await execa(pythonCmd, ['-m', 'venv', venvDir], { stdio: 'inherit', reject: false });
  }
  // Install requirements into venv if needed
  const venvPython = resolve(venvDir, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  const pythonExe = existsSync(venvPython) ? venvPython : pythonCmd;
  log.dim(`  Installing python requirements via ${pythonExe} ...`);
  await execa(pythonExe, ['-m', 'pip', 'install', '-q', '-r', reqFile], { stdio: 'inherit', reject: false });
}

export async function callPython(options: PythonCallOptions): Promise<PythonCallResult> {
  const { modulePath, args = [], cwd, timeout = 30000, env = {} } = options;
  const safeArgs = args.map(sanitizeArg);
  const pythonPath = process.env.WB_PYTHON || getPythonBin();
  const packageDir = getPackageDir();
  const fullCwd = cwd ? expandHomePath(cwd) : process.cwd();

  // Dynamic venv setup
  await ensureVenv(packageDir, pythonPath);

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
        return { success: true, data: parsed };
      } catch {
        return { success: true, data: { raw: result.stdout.trim() } };
      }
    }

    if (result.exitCode !== 0) {
      return { success: false, error: result.stderr || result.stdout || 'Unknown Python error', stderr: result.stderr };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to execute Python' };
  }
}

export async function callPythonScript(scriptPath: string, args: string[] = []): Promise<PythonCallResult> {
  const safeArgs = args.map(sanitizeArg);
  const pythonPath = process.env.WB_PYTHON || getPythonBin();
  const packageDir = getPackageDir();
  const fullPath = expandHomePath(scriptPath);
  const scriptRelative = resolve(packageDir, fullPath);

  // If script path wasn't absolute, resolve against packageDir
  const targetPath = existsSync(fullPath) ? fullPath : scriptRelative;

  // Ensure venv for script executions too
  await ensureVenv(packageDir, pythonPath);

  try {
    const venvDir = resolve(packageDir, '.venv');
    const venvPython = resolve(venvDir, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
    const pythonExe = existsSync(venvPython) ? venvPython : pythonPath;

    const result = await execa(pythonExe, [targetPath, ...safeArgs], {
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
      return { success: false, error: result.stderr || result.stdout || 'Unknown Python error' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
