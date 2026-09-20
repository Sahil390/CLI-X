import { Command } from 'commander';
import * as path from 'path';
import { ui } from '../ui/logger';
import { Spinner } from '../ui/spinner';
import { ProjectManager } from '../../application/project-manager';
import { FilesystemTool } from '../../tools/filesystem';
import { PackageManagerTool } from '../../tools/package-manager';
import { GitTool } from '../../tools/git';
import { ProjectMemory } from '../../project/project-memory';

// ============================================================
// CLI-X — create command
// Initializes a new website project from a template.
// ============================================================

export function createCommand(): Command {
  return new Command('create')
    .argument('[name]', 'Project name', 'my-project')
    .option('-t, --template <template>', 'Project template (react|next|vanilla)', 'vanilla')
    .option('--no-install', 'Skip dependency installation')
    .description('Create a new website project')
    .action(async (name: string, options: { template: string; install: boolean }) => {
      const { template, install } = options;
      const targetDir = process.cwd();
      const projectRoot = path.join(targetDir, name);

      ui.info(`Initializing project ${ui['print'] ? '' : ''}"`);

      // Show project plan
      ui.blank();
      ui.field('Name', name);
      ui.field('Template', template);
      ui.field('Directory', projectRoot);
      ui.blank();

      // Check target doesn't already exist
      if (FilesystemTool.exists(projectRoot)) {
        ui.error(`Directory "${name}" already exists in ${targetDir}`);
        process.exit(1);
      }

      const manager = new ProjectManager();

      const spinner = new Spinner(`Scaffolding ${template} project...`);
      spinner.start();

      try {
        const root = await manager.scaffoldProject(
          name,
          template as 'react' | 'next' | 'vanilla',
          targetDir
        );
        spinner.succeed(`Project scaffolded at ${root}`);
      } catch (e) {
        spinner.fail(`Scaffolding failed: ${(e as Error).message}`);
        process.exit(1);
      }

      // Git init
      if (await GitTool.isAvailable()) {
        const gitSpinner = new Spinner('Initializing Git repository...');
        gitSpinner.start();
        try {
          await GitTool.init(projectRoot);
          gitSpinner.succeed('Git repository initialized');
        } catch {
          gitSpinner.warn('Git init skipped');
        }
      }

      // Install dependencies
      if (install && FilesystemTool.exists(path.join(projectRoot, 'package.json'))) {
        const installSpinner = new Spinner('Installing dependencies...');
        installSpinner.start();
        try {
          await PackageManagerTool.install(projectRoot);
          installSpinner.succeed('Dependencies installed');
        } catch (e) {
          installSpinner.fail(`Install failed: ${(e as Error).message}`);
        }
      }

      ui.blank();
      ui.success(`Project "${name}" ready!`);
      ui.blank();
      ui.muted(`Next steps:`);
      ui.muted(`  cd ${name}`);
      ui.muted(`  cli-x chat "describe what you want to build"`);
      ui.blank();
    });
}
