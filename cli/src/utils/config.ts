import fs from 'fs';
import path from 'path';

export function loadConfig(projectDir?: string, cliOverrides?: Record<string, unknown>): Record<string, unknown> {
  const filePath = projectDir ? path.join(projectDir, 'website-builder.config.json') : 'website-builder.config.json';
  let fileConfig: Record<string, unknown> = {};
  try { if (fs.existsSync(filePath)) fileConfig = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>; } catch { /* ignore malformed */ }
  const envConfig: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('WB_')) envConfig[k.replace('WB_', '').toLowerCase()] = v;
  }
  // CORRECT cascade: CLI flags > env > file
  const defined = cliOverrides ? Object.fromEntries(Object.entries(cliOverrides).filter(([, v]) => v !== undefined)) : {};
  return { ...fileConfig, ...envConfig, ...defined };
}
