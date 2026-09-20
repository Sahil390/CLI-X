import { Command } from 'commander';
import { ui } from '../ui/logger';
import { DeploymentManager, DeploymentTarget } from '../../application/deployment-manager';
import { ProjectManager } from '../../application/project-manager';

// ============================================================
// CLI-X — deploy command
// Routes deployment to the appropriate provider.
// ============================================================

export function deployCommand(): Command {
  return new Command('deploy')
    .argument('[target]', 'Deployment target (local|amplify|s3|vercel|netlify)', 'local')
    .option('--project <path>', 'Project root directory', process.cwd())
    .option('--build-dir <dir>', 'Build output directory', 'dist')
    .option('--region <region>', 'AWS region for cloud deployments', 'us-east-1')
    .description('Deploy the project using a provider interface')
    .action(async (target: string, options: { project: string; buildDir: string; region: string }) => {
      const { project: projectRoot, buildDir, region } = options;

      ui.info(`Starting deployment to ${target}...`);
      ui.blank();

      const manager = new DeploymentManager();

      try {
        const result = await manager.deploy({
          target: target as DeploymentTarget,
          projectRoot,
          buildDir,
          region,
        });

        if (result.status === 'success') {
          ui.success(`Deployed successfully`);
          if (result.url) {
            ui.listen(`Available at: ${result.url}`);
          }
        } else {
          ui.error(result.message);
          process.exit(1);
        }
      } catch (e) {
        const err = e as Error;
        if (err.constructor.name === 'NotImplementedError') {
          ui.warning(`${target} deployment is not yet wired.`);
          ui.muted('This will be implemented in Step 5 (external integrations).');
          ui.muted(`Supported targets: ${manager.listTargets().join(', ')}`);
        } else {
          ui.error(err.message);
          process.exit(1);
        }
      }
    });
}
