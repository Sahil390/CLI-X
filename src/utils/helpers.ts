import * as net from 'net';

// ============================================================
// CLI-X — Shared Helpers
// ============================================================

/**
 * Probes whether a TCP port is available on localhost.
 * Returns true if the port is free, false if in use.
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Finds the next available port starting from `startPort`.
 * Scans up to `maxAttempts` ports sequentially.
 */
export async function findAvailablePort(
  startPort = 3000,
  maxAttempts = 20
): Promise<number> {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${startPort}–${startPort + maxAttempts}`);
}

/**
 * Detects the package manager used in a project directory
 * by inspecting lockfile presence.
 */
export function detectPackageManager(cwd: string): 'npm' | 'yarn' | 'pnpm' {
  const fs = require('fs');
  if (fs.existsSync(`${cwd}/pnpm-lock.yaml`)) return 'pnpm';
  if (fs.existsSync(`${cwd}/yarn.lock`)) return 'yarn';
  return 'npm';
}

/**
 * Parses a project's package.json scripts field to detect
 * the correct dev server command.
 */
export function detectDevScript(packageJsonPath: string): string {
  try {
    const pkg = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf-8'));
    const scripts: Record<string, string> = pkg.scripts ?? {};
    if (scripts['dev']) return 'dev';
    if (scripts['start']) return 'start';
    if (scripts['serve']) return 'serve';
    return 'start';
  } catch {
    return 'start';
  }
}

/**
 * Returns a human-readable timestamp string.
 */
export function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Truncates a string to `maxLength` chars, appending `…` if cut.
 */
export function truncate(str: string, maxLength = 80): string {
  return str.length > maxLength ? `${str.slice(0, maxLength - 1)}…` : str;
}

/**
 * Sleeps for `ms` milliseconds (useful in repair loops).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
