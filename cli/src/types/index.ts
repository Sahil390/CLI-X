export interface WbConfig {
  defaultProvider: string;
  auth: Record<string, AuthSession>;
  ai: AiConfig;
  build: BuildConfig;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface AiConfig {
  provider: string;
  model: string;
  apiKeyEnv: string;
  baseUrl?: string;
}

export interface BuildConfig {
  input: string;
  output: string;
  template: string;
  minify: boolean;
}

export interface DeployConfig {
  target: string;
  ssh?: SshConfig;
  github?: GithubConfig;
  local?: LocalConfig;
  domain?: string;
}

export interface SshConfig {
  host: string;
  user: string;
  path: string;
  keyPath?: string;
  port?: number;
}

export interface GithubConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface LocalConfig {
  path: string;
}

export interface ProjectConfig {
  name: string;
  template: string;
  build: {
    input: string;
    output: string;
  };
  deploy: DeployConfig;
}

export interface BuildResult {
  files: number;
  sizeBytes: number;
  duration: number;
  outputDir: string;
  errors: string[];
}

export interface DeployResult {
  success: boolean;
  url?: string;
  duration: number;
  message: string;
}

export interface TemplateInfo {
  name: string;
  description: string;
  pages: string[];
  hasStyles: boolean;
  hasScripts: boolean;
}

export const GLOBAL_CONFIG_PATH = '~/.website-builder/config.json';
export const PROJECT_CONFIG_FILE = 'website-builder.config.json';
export const DEFAULT_PORT = 8420;
export const OAUTH_PORT = 8080;
