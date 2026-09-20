import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigError } from '../utils/errors';

// ============================================================
// CLI-X — Global Configuration
// Stored in ~/.cli-x/config.json
// ============================================================

export type CliMode = 'cloud' | 'local';
export type LogLevel = 'silent' | 'info' | 'verbose' | 'debug';

export interface GlobalConfig {
  version: string;
  ai: {
    mode: CliMode;
    provider: string;
    model: string;
    apiKey?: string;
  };
  deployment: {
    provider: string;
    region?: string;
  };
  ui: {
    logLevel: LogLevel;
    color: boolean;
    emoji: boolean;
  };
}

const CONFIG_DIR = path.join(os.homedir(), '.cli-x');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  version: '0.1.0',
  ai: {
    mode: 'cloud',
    provider: 'auto',
    model: 'auto',
  },
  deployment: {
    provider: 'local',
    region: 'us-east-1',
  },
  ui: {
    logLevel: 'info',
    color: true,
    emoji: true,
  },
};

export class GlobalConfigManager {
  /** Returns the default configuration. */
  getDefault(): GlobalConfig {
    return { ...DEFAULT_GLOBAL_CONFIG };
  }

  /** Loads config from ~/.cli-x/config.json, falling back to defaults. */
  load(): GlobalConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<GlobalConfig>;
        return this.merge(DEFAULT_GLOBAL_CONFIG, parsed);
      }
    } catch (e) {
      // Fall through to defaults on any parse error
    }
    return this.getDefault();
  }

  /** Saves the provided config to ~/.cli-x/config.json. */
  save(config: GlobalConfig): void {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
      throw new ConfigError(`Failed to save global config: ${(e as Error).message}`);
    }
  }

  /** Loads config, then overlays environment variable overrides. */
  loadWithEnv(): GlobalConfig {
    const base = this.load();
    return {
      ...base,
      ai: {
        ...base.ai,
        provider: process.env.CLI_X_AI_PROVIDER ?? base.ai.provider,
        model: process.env.CLI_X_AI_MODEL ?? base.ai.model,
        apiKey: process.env.CLI_X_API_KEY ?? base.ai.apiKey,
      },
      deployment: {
        ...base.deployment,
        provider: process.env.CLI_X_DEPLOY_PROVIDER ?? base.deployment.provider,
        region: process.env.AWS_DEFAULT_REGION ?? base.deployment.region,
      },
    };
  }

  private merge(defaults: GlobalConfig, overrides: Partial<GlobalConfig>): GlobalConfig {
    return {
      ...defaults,
      ...overrides,
      ai: { ...defaults.ai, ...(overrides.ai ?? {}) },
      deployment: { ...defaults.deployment, ...(overrides.deployment ?? {}) },
      ui: { ...defaults.ui, ...(overrides.ui ?? {}) },
    };
  }
}
