import { GlobalConfigManager, GlobalConfig } from '../config/global-config';
import { ProjectConfigManager, ProjectConfig } from '../config/project-config';

// ============================================================
// CLI-X — Configuration Manager (Application Layer)
// Orchestrates global + project config resolution.
// ============================================================

export type { GlobalConfig, ProjectConfig };
export type { CliMode } from '../config/global-config';

export class ConfigurationManager {
  private readonly globalManager = new GlobalConfigManager();

  /** Returns factory defaults without reading any files. */
  getDefaultConfig(): GlobalConfig {
    return this.globalManager.getDefault();
  }

  /** Loads global config with env var overrides applied. */
  loadGlobal(): GlobalConfig {
    return this.globalManager.loadWithEnv();
  }

  /** Saves updated global config. */
  saveGlobal(config: GlobalConfig): void {
    this.globalManager.save(config);
  }

  /** Returns a ProjectConfigManager bound to the given project root. */
  forProject(projectRoot: string): ProjectConfigManager {
    return new ProjectConfigManager(projectRoot);
  }

  /** Returns a human-readable summary of the current config. */
  formatConfig(config: GlobalConfig): string {
    return [
      `AI Provider : ${config.ai.provider}`,
      `AI Model    : ${config.ai.model}`,
      `Mode        : ${config.ai.mode}`,
      `Deploy      : ${config.deployment.provider}`,
      `Region      : ${config.deployment.region ?? 'us-east-1'}`,
      `Log Level   : ${config.ui.logLevel}`,
    ].join('\n');
  }
}
