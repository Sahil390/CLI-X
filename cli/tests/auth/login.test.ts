import { login } from '../../src/commands/login';
import { callPython } from '../../src/bridge/python';
import { log } from '../../src/ui/logger';
import { prompt, select, confirm } from '../../src/ui/prompts';
import { readJson, fileExists, writeJson } from '../../src/utils/fs';
import { expandHomePath, resolveGlobalConfigPath } from '../../src/utils/path';

jest.mock('../../src/bridge/python');
jest.mock('../../src/ui/logger');
jest.mock('../../src/ui/prompts');
jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/path', () => ({
  expandHomePath: jest.fn((p: string) => p.replace('~', '/home/user')),
  resolveGlobalConfigPath: jest.fn(() => '/home/user/.website-builder/config.json'),
}));

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login with specified provider via Python', async () => {
    (fileExists as jest.Mock).mockResolvedValue(false);
    (callPython as jest.Mock).mockResolvedValue({
      success: true,
      data: { url: 'https://github.com/login/oauth/authorize' },
    });

    await login('github');

    expect(callPython).toHaveBeenCalledWith({
      modulePath: 'backend.auth.oauth',
      args: ['--provider', 'github'],
    });
    expect(log.success).toHaveBeenCalled();
  });

  it('should login via API key when provider is api-key', async () => {
    (prompt as jest.Mock).mockResolvedValue({ token: 'secret-key' });
    (writeJson as jest.Mock).mockResolvedValue(undefined);

    await login('api-key');

    expect(callPython).not.toHaveBeenCalled();
    expect(log.success).toHaveBeenCalled();
  });

  it('should show currently logged in providers', async () => {
    (fileExists as jest.Mock).mockResolvedValue(true);
    (readJson as jest.Mock).mockResolvedValue({
      auth: { github: { token: 'abc' } },
    });
    (confirm as jest.Mock).mockResolvedValue(false);

    await login();

    expect(log.info).toHaveBeenCalledWith('Currently logged in: github');
    expect(callPython).not.toHaveBeenCalled();
  });
});
