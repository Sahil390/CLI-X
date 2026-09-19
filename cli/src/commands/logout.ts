import { expandHomePath, fileExists, readJson } from '../utils/fs.js';
import { resolveGlobalConfigPath } from '../utils/path.js';
import { log } from '../ui/logger.js';
import { confirm } from '../ui/prompts.js';

export async function logout(provider?: string, options?: { json?: boolean }): Promise<void> {
  log.title('Logout');

  const globalConfigPath = expandHomePath(resolveGlobalConfigPath());
  if (!(await fileExists(globalConfigPath))) {
    log.warn('No sessions found.');
    return;
  }

  const config = await readJson(globalConfigPath) as any;
  const auth = config.auth || {};

  if (provider) {
    if (auth[provider]) {
      delete auth[provider];
      config.auth = auth;
      await import('../utils/fs.js').then(async (m) => {
        await m.writeJson(globalConfigPath, config);
      });
      log.success(`Logged out from ${provider}`);
    } else {
      log.warn(`No active session for ${provider}`);
    }
    return;
  }

  const providers = Object.keys(auth);
  if (providers.length === 0) {
    log.warn('No active sessions.');
    return;
  }

  if (providers.length === 1 || await confirm(`Logout from ${providers.join(', ')}?`)) {
    config.auth = {};
    await import('../utils/fs.js').then(async (m) => {
      await m.writeJson(globalConfigPath, config);
    });
    log.success('Logged out from all providers');
  }
}
