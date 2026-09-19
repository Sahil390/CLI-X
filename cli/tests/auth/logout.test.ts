import { logout } from '../../src/commands/logout';
import { log } from '../../src/ui/logger';
import { readJson, fileExists } from '../../src/utils/fs';
import { expandHomePath, resolveGlobalConfigPath } from '../../src/utils/path';

jest.mock('../../src/ui/logger');
jest.mock('../../src/ui/prompts');
jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/path', () => ({
  expandHomePath: jest.fn((p: string) => p.replace('~', '/home/user')),
  resolveGlobalConfigPath: jest.fn(() => '/home/user/.website-builder/config.json'),
}));

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should logout specific provider', async () => {
    (fileExists as jest.Mock).mockResolvedValue(true);
    (readJson as jest.Mock).mockResolvedValue({
      auth: { github: { token: 'abc' }, ssh: { token: 'def' } },
    });

    await logout('github');

    expect(log.success).toHaveBeenCalledWith('Logged out from github');
  });

  it('should warn when provider not found', async () => {
    (fileExists as jest.Mock).mockResolvedValue(true);
    (readJson as jest.Mock).mockResolvedValue({
      auth: { github: { token: 'abc' } },
    });

    await logout('vercel');

    expect(log.warn).toHaveBeenCalledWith('No active session for vercel');
  });

  it('should logout all providers', async () => {
    (fileExists as jest.Mock).mockResolvedValue(true);
    (readJson as jest.Mock).mockResolvedValue({
      auth: { github: { token: 'abc' } },
    });

    const { confirm } = require('../../src/ui/prompts');
    confirm.mockResolvedValue(true);

    await logout();

    expect(log.success).toHaveBeenCalledWith('Logged out from all providers');
  });

  it('should warn when no sessions exist', async () => {
    (fileExists as jest.Mock).mockResolvedValue(false);

    await logout();

    expect(log.warn).toHaveBeenCalledWith('No sessions found.');
  });
});
