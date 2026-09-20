import { DeploymentError } from '../utils/errors';

// ============================================================
// CLI-X — Local Deployment Provider
// Serves the built output locally via a static server.
// ============================================================

export interface LocalDeployOptions {
  buildDir: string;
  port?: number;
}

export interface LocalDeployResult {
  url: string;
  buildDir: string;
  port: number;
}

export class LocalProvider {
  /**
   * Validates the build output exists and returns a local file URL.
   * A real static server (e.g. `serve`) would be spawned in Step 5.
   */
  async deploy(buildDir: string, port = 4000): Promise<LocalDeployResult> {
    const { FilesystemTool } = await import('../tools/filesystem');
    const path = await import('path');

    const indexPath = path.join(buildDir, 'index.html');
    if (!FilesystemTool.exists(indexPath)) {
      throw new DeploymentError(
        `Build output not found at ${buildDir}. Run "cli-x build" first.`
      );
    }

    return {
      url: `http://localhost:${port}`,
      buildDir,
      port,
    };
  }
}
