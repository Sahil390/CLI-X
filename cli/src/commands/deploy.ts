import { callPython } from '../bridge/python.js';
import path from 'path';
import { createSpinner, stopWithSuccess, stopWithFailure } from '../ui/spinner.js';
import { log } from '../ui/logger.js';
import { readJson } from '../utils/fs.js';
import { resolveConfigPath, projectRoot } from '../utils/path.js';
import { fileExists } from '../utils/fs.js';
import type { DeployResult } from '../types/index.js';

export async function deploy(target?: string, options?: { rollback?: string; json?: boolean }): Promise<void> {
  log.title('Deploying Site');

  const configPath = resolveConfigPath();
  let deployTarget = target || 'local';

  if (!target && await fileExists(configPath)) {
    const config = await readJson(configPath) as any;
    deployTarget = config.deploy?.target || 'local';
  }

  const spinner = createSpinner(`Deploying to ${deployTarget}...`);

  const result = await callPython({
    modulePath: 'backend.deploy.orchestrator',
    args: ['--target', deployTarget, '--config', path.join(projectRoot(), 'website-builder.config.json')],
  });

  if (!result.success || !result.data) {
    stopWithFailure(spinner, 'Deployment failed');
    log.error(result.error || 'Unknown error');
    return;
  }

  const deployResult: DeployResult = result.data as unknown as DeployResult;
  stopWithSuccess(spinner, 'Deployment complete');

  if (deployResult.success && deployResult.url) {
    log.success(`Deployed successfully!`);
    log.info(`URL: ${deployResult.url}`);
  } else {
    log.warn(`Deployed with warnings: ${deployResult.message}`);
  }
}
