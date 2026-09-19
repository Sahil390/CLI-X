import { callPython } from '../bridge/python.js';
import { log } from '../ui/logger.js';
import { prompt, select, confirm } from '../ui/prompts.js';
import { readJson, fileExists, expandHomePath } from '../utils/fs.js';
import { resolveGlobalConfigPath, projectRoot } from '../utils/path.js';
import type { AuthSession } from '../types/index.js';

export async function login(provider?: string, options?: { json?: boolean }): Promise<void> {
  log.title('Authentication');

  const globalConfigPath = expandHomePath(resolveGlobalConfigPath());
  let sessions: Record<string, AuthSession> = {};
  if (await fileExists(globalConfigPath)) {
    const config = await readJson(globalConfigPath) as any;
    sessions = config.auth || {};
  }

  if (provider) {
    if (sessions[provider]) {
      log.info(`Already logged in to ${provider}`);
      return;
    }
    await doLogin(provider);
    return;
  }

  const existingProviders = Object.keys(sessions);
  if (existingProviders.length > 0) {
    log.info(`Currently logged in: ${existingProviders.join(', ')}`);
    const shouldLoginMore = await confirm('Log in to another provider?');
    if (!shouldLoginMore) return;
  }

  const providerChoices = [
    { name: 'GitHub', value: 'github' },
    { name: 'SSH/Server', value: 'ssh' },
    { name: 'API Key', value: 'api-key' },
  ];

  provider = await select('Choose a provider', providerChoices) as string;
  await doLogin(provider);
}

async function doLogin(provider: string): Promise<void> {
  if (provider === 'api-key') {
    await loginApiKey();
    return;
  }

  const result = await callPython({
    modulePath: 'backend.auth.oauth',
    args: ['--provider', provider],
  });

  if (result.success && result.data) {
    log.success(`Logged in to ${provider}`);
    if (result.data.url) {
      log.info(`Auth URL: ${result.data.url}`);
    }
  } else {
    log.error(`Login failed: ${result.error}`);
  }
}

async function loginApiKey(): Promise<void> {
  log.info('API Key authentication');
  log.dim('You can get your API key from your provider dashboard.');

  const token = await prompt([{ type: 'password', name: 'token', message: 'Enter your API key' } as any]);

  const globalConfigPath = expandHomePath(resolveGlobalConfigPath());
  let config: Record<string, any> = {};
  if (await fileExists(globalConfigPath)) {
    config = await readJson(globalConfigPath) as any;
  }

  config.auth = config.auth || {};
  config.auth['api-key'] = { token: token.token, type: 'api-key' };

  await import('../utils/fs.js').then(async (m) => {
    await m.writeJson(globalConfigPath, config);
  });

  log.success('API key saved');
}
