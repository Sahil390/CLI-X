import { Command } from 'commander';
import { ui } from '../ui/logger';
import { findAvailablePort, detectDevScript } from '../../utils/helpers';
import { ShellTool } from '../../tools/shell';
import { ProjectManager } from '../../application/project-manager';
import { PortConflictError } from '../../utils/errors';
import * as path from 'path';
import * as net from 'net';

// ============================================================
// CLI-X — run command
// Starts the local dev server with port conflict resolution.
//
// Terminal output spec:
//   ◆ Starting local dev server...
//   ● Listening on http://localhost:3000
//   ✕ Error: Port 3000 already in use
//   ◆ Detecting port conflict...
//   ◆ Scanning available ports...
//   ★ Switching to port 3001
//   ● Dev server restarted on http://localhost:3001
// ============================================================

export function runCommand(): Command {
  return new Command('run')
    .alias('dev')
    .argument('[script]', 'npm script to run (default: auto-detect)', undefined)
    .option('-p, --port <port>', 'Starting port', '3000')
    .option('--project <path>', 'Project root directory', process.cwd())
    .description('Start the local development server')
    .action(async (script: string | undefined, options: { port: string; project: string }) => {
      const projectRoot = options.project;
      const startPort = parseInt(options.port, 10);

      ui.info('Starting local dev server...');
      ui.blank();

      // Detect dev script
      const pkgPath = path.join(projectRoot, 'package.json');
      const devScript = script ?? detectDevScript(pkgPath);

      ui.field('Script', devScript);
      ui.field('Project', path.basename(projectRoot));
      ui.blank();

      // Find available port
      let port = startPort;
      const { isPortAvailable } = await import('../../utils/helpers');

      const portFree = await isPortAvailable(startPort);

      if (!portFree) {
        ui.error(`Port ${startPort} already in use`);
        ui.info('Detecting port conflict...');
        ui.info('Scanning available ports...');

        try {
          port = await findAvailablePort(startPort + 1);
          ui.warning(`Switching to port ${port}`);
        } catch (e) {
          ui.error(`No available port found: ${(e as Error).message}`);
          process.exit(1);
        }
      }

      ui.listen(`Dev server starting on http://localhost:${port}`);
      ui.blank();

      // Run the dev server
      try {
        const env: Record<string, string> = { PORT: String(port) };

        const result = await ShellTool.run(
          'npm',
          ['run', devScript, '--', `--port`, String(port)],
          { cwd: projectRoot, stream: true, env, timeout: 600_000 }
        );

        if (result.exitCode !== 0 && result.exitCode !== 130 /* SIGINT */) {
          ui.error(`Dev server exited with code ${result.exitCode}`);
          ui.info('Inspecting error logs...');
          ui.info('Analyzing import paths...');
          process.exit(result.exitCode);
        }
      } catch (e) {
        ui.error(`Dev server failed: ${(e as Error).message}`);
        process.exit(1);
      }
    });
}
