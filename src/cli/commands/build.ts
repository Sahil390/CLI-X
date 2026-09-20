import { Command } from 'commander';
import { ui } from '../ui/logger';
import { ValidationRepairLoop } from '../../validation/repair-loop';
import { BuildManager } from '../../application/build-manager';
import { ProjectManager } from '../../application/project-manager';
import { ProjectMemory } from '../../project/project-memory';

// ============================================================
// CLI-X — build command
// Runs build validation and self-repair loop.
// ============================================================

export function buildCommand(): Command {
  return new Command('build')
    .option('-p, --project <path>', 'Project root directory', process.cwd())
    .option('--repair', 'Enable self-repair loop on failure', false)
    .description('Run the project build and validation workflow')
    .action(async (options: { project: string; repair: boolean }) => {
      const projectRoot = options.project;

      ui.info('Build workflow started');
      ui.blank();

      // Detect project
      let projectInfo;
      try {
        const manager = new ProjectManager();
        projectInfo = await manager.detectProject(projectRoot);
        ui.field('Project', projectInfo.name);
        ui.field('Framework', projectInfo.detectedFramework);
        ui.field('Language', projectInfo.language);
        ui.blank();
      } catch (e) {
        ui.warning(`Project detection: ${(e as Error).message}`);
      }

      const buildManager = new BuildManager();

      if (options.repair) {
        // Self-repair loop
        const repairLoop = new ValidationRepairLoop();
        const result = await repairLoop.run(projectRoot);

        if (!result.success) {
          process.exit(1);
        }
      } else {
        // Single build pass
        const result = await buildManager.build(projectRoot);

        if (result.success) {
          ui.success('Build passed');
          ui.success(`${result.errors.length} errors · ${result.warnings.length} warnings · Ready`);
        } else {
          result.errors.forEach((e) => {
            ui.error(`${e.file ?? 'unknown'}:${e.line ?? '?'} — ${e.message}`);
          });
          ui.muted('Run with --repair to enable self-repair loop');
          process.exit(1);
        }
      }

      // Log to project memory
      const memory = new ProjectMemory(projectRoot);
      if (memory.exists()) {
        await memory.addHistoryEvent({ type: 'build', description: 'Build completed' });
      }
    });
}
