import { log } from '../ui/logger.js';
import { readJson, fileExists, writeJson, expandHomePath } from '../utils/fs.js';
import { resolveGlobalConfigPath, resolveConfigPath, projectRoot } from '../utils/path.js';
import { prompt, input, select, confirm } from '../ui/prompts.js';
import type { WbConfig } from '../types/index.js';

export async function config(): Promise<void> {
  log.title('Configuration');

  const globalConfigPath = expandHomePath(resolveGlobalConfigPath());
  const projectConfigPath = resolveConfigPath();

  const action = await select('What would you like to do?', [
    { name: 'View global config', value: 'view-global' },
    { name: 'View project config', value: 'view-project' },
    { name: 'Set default provider', value: 'set-provider' },
    { name: 'Set AI provider', value: 'set-ai' },
    { name: 'Reset all config', value: 'reset' },
  ]);

  switch (action) {
    case 'view-global': {
      if (await fileExists(globalConfigPath)) {
        const config = await readJson(globalConfigPath) as any;
        log.success('Global config:');
        console.log(JSON.stringify(config, null, 2));
      } else {
        log.warn('No global config found');
      }
      break;
    }
    case 'view-project': {
      if (await fileExists(projectConfigPath)) {
        const config = await readJson(projectConfigPath) as any;
        log.success('Project config:');
        console.log(JSON.stringify(config, null, 2));
      } else {
        log.warn('No project config found. Run wb init first.');
      }
      break;
    }
    case 'set-provider': {
      const provider = await select('Default provider', ['local', 'ssh', 'github', 'vercel', 'netlify']);
      await updateGlobalConfig({ defaultProvider: provider });
      break;
    }
    case 'set-ai': {
      const aiProvider = await select('AI provider', ['openai', 'anthropic', 'local']);
      await updateGlobalConfig({ ai: { provider: aiProvider, model: 'default', apiKeyEnv: `${aiProvider.toUpperCase()}_API_KEY` } });
      break;
    }
    case 'reset': {
      if (await fileExists(globalConfigPath)) {
        const proceed = await confirm('Reset all global config? This will remove saved sessions.');
        if (proceed) {
          await writeJson(globalConfigPath, { auth: {}, build: { minify: true, outputDir: 'dist' } });
          log.success('Global config reset');
        }
      }
      break;
    }
  }
}

async function updateGlobalConfig(updates: Partial<WbConfig>): Promise<void> {
  const globalConfigPath = expandHomePath(resolveGlobalConfigPath());
  let config: any = {};
  if (await fileExists(globalConfigPath)) {
    config = await readJson(globalConfigPath) as any;
  }

  const merged = { ...config, ...updates };
  if (updates.ai && config.ai) {
    merged.ai = { ...config.ai, ...updates.ai };
  }
  if (updates.build && config.build) {
    merged.build = { ...config.build, ...updates.build };
  }

  await writeJson(globalConfigPath, merged);
  log.success('Configuration updated');
}
