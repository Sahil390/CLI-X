import { NotImplementedError } from '../utils/errors';

// ============================================================
// CLI-X — Deployment Manager (Application Layer)
// Routes deployment requests to provider implementations.
// ============================================================

export type DeploymentTarget = 'local' | 'amplify' | 's3' | 'vercel' | 'netlify';

export interface DeploymentOptions {
  target: DeploymentTarget;
  projectRoot: string;
  buildDir?: string;
  region?: string;
}

export interface DeploymentResult {
  target: DeploymentTarget;
  status: 'success' | 'failed' | 'pending';
  url?: string;
  message: string;
}

export class DeploymentManager {
  /**
   * Dispatches a deployment to the appropriate provider.
   * Local provider copies the build output; cloud providers are stubs.
   */
  async deploy(options: DeploymentOptions): Promise<DeploymentResult> {
    const { target, projectRoot, buildDir = 'dist' } = options;

    switch (target) {
      case 'local':
        return this.deployLocal(projectRoot, buildDir);
      case 'amplify':
      case 's3':
      case 'vercel':
      case 'netlify':
        throw new NotImplementedError(`${target} deployment`);
      default:
        throw new Error(`Unknown deployment target: ${target}`);
    }
  }

  private async deployLocal(projectRoot: string, buildDir: string): Promise<DeploymentResult> {
    // Local deploy: just confirms the build output directory exists
    const { FilesystemTool } = await import('../tools/filesystem');
    const path = await import('path');
    const distPath = path.join(projectRoot, buildDir);

    const exists = FilesystemTool.exists(distPath);
    return {
      target: 'local',
      status: exists ? 'success' : 'failed',
      url: exists ? `file://${distPath}/index.html` : undefined,
      message: exists
        ? `Local deployment ready at ${distPath}`
        : `Build output not found at ${distPath}. Run "cli-x build" first.`,
    };
  }

  /** Returns the list of supported deployment targets. */
  listTargets(): DeploymentTarget[] {
    return ['local', 'amplify', 's3', 'vercel', 'netlify'];
  }
}
