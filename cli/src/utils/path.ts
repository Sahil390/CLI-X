import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function projectRoot(): string {
  return process.cwd();
}

export function resolveConfigPath(): string {
  return path.join(projectRoot(), 'website-builder.config.json');
}

export function resolveSourceDir(configInput?: string): string {
  return path.join(projectRoot(), configInput || 'src');
}

export function resolveOutputDir(configOutput?: string): string {
  return path.join(projectRoot(), configOutput || 'dist');
}

export function resolveTemplatesDir(templateName: string): string {
  return path.join(__dirname, '..', '..', '..', 'backend', 'backend', 'templates', templateName);
}

export function resolveGlobalConfigDir(): string {
  return path.join(process.env.HOME || process.env.USERPROFILE || '', '.website-builder');
}

export function resolveGlobalConfigPath(): string {
  return path.join(resolveGlobalConfigDir(), 'config.json');
}
