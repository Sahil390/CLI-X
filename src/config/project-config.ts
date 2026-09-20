import * as fs from 'fs';
import * as path from 'path';
import { ConfigError } from '../utils/errors';

// ============================================================
// CLI-X — Project Configuration
// Stored in <project>/.ai/project.json
// ============================================================

export interface ProjectConfig {
  name: string;
  version: string;
  framework: string;
  language: 'typescript' | 'javascript';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  deployment: {
    provider: string;
    target?: string;
  };
  ai: {
    provider?: string;
    model?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_PROJECT_CONFIG: Omit<ProjectConfig, 'name' | 'createdAt' | 'updatedAt'> = {
  version: '0.1.0',
  framework: 'unknown',
  language: 'typescript',
  packageManager: 'npm',
  deployment: {
    provider: 'local',
  },
  ai: {},
};

export class ProjectConfigManager {
  private readonly configPath: string;

  constructor(projectRoot: string) {
    this.configPath = path.join(projectRoot, '.ai', 'project.json');
  }

  exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  load(): ProjectConfig {
    if (!fs.existsSync(this.configPath)) {
      throw new ConfigError(`No project config found at ${this.configPath}. Run "cli-x create" first.`);
    }
    try {
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(raw) as ProjectConfig;
    } catch (e) {
      throw new ConfigError(`Failed to parse project config: ${(e as Error).message}`);
    }
  }

  create(name: string, overrides: Partial<ProjectConfig> = {}): ProjectConfig {
    const now = new Date().toISOString();
    const config: ProjectConfig = {
      ...DEFAULT_PROJECT_CONFIG,
      name,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
    this.save(config);
    return config;
  }

  update(updates: Partial<ProjectConfig>): ProjectConfig {
    const existing = this.load();
    const updated: ProjectConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save(updated);
    return updated;
  }

  save(config: ProjectConfig): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
      throw new ConfigError(`Failed to save project config: ${(e as Error).message}`);
    }
  }
}
