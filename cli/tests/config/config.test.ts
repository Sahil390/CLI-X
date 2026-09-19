import { config } from '../../src/commands/config';
import { log } from '../../src/ui/logger';
import { readJson, fileExists, writeJson } from '../../src/utils/fs';
import { expandHomePath, resolveGlobalConfigPath, resolveConfigPath, projectRoot } from '../../src/utils/path';
import { prompt, select, input, confirm } from '../../src/ui/prompts';

jest.mock('../../src/ui/logger');
jest.mock('../../src/ui/prompts');
jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/path', () => ({
  expandHomePath: jest.fn((p: string) => p.replace('~', '/home/user')),
  resolveGlobalConfigPath: jest.fn(() => '/home/user/.website-builder/config.json'),
  resolveConfigPath: jest.fn(() => '/fake/website-builder.config.json'),
  projectRoot: jest.fn(() => '/fake'),
}));

describe('config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should view global config', async () => {
    (fileExists as jest.Mock).mockImplementation((path: string) =>
      Promise.resolve(path === '/home/user/.website-builder/config.json'));
    (readJson as jest.Mock).mockResolvedValue({ build: { minify: true } });
    (select as jest.Mock).mockResolvedValue('view-global');

    await config();

    expect(log.success).toHaveBeenCalledWith('Global config:');
  });

  it('should warn when no global config found', async () => {
    (fileExists as jest.Mock).mockImplementation((path: string) =>
      Promise.resolve(path === '/home/user/.website-builder/config.json' ? false : true));
    (select as jest.Mock).mockResolvedValue('view-global');

    await config();

    expect(log.warn).toHaveBeenCalledWith('No global config found');
  });

  it('should view project config', async () => {
    (fileExists as jest.Mock).mockImplementation((path: string) =>
      Promise.resolve(path === '/fake/website-builder.config.json'));
    (readJson as jest.Mock).mockResolvedValue({ name: 'my-site' });
    (select as jest.Mock).mockResolvedValue('view-project');

    await config();

    expect(log.success).toHaveBeenCalledWith('Project config:');
  });

  it('should set default provider', async () => {
    (select as jest.Mock).mockResolvedValue('set-provider');
    (select as jest.Mock).mockResolvedValueOnce('vercel'); // provider selection
    (writeJson as jest.Mock).mockResolvedValue(undefined);

    await config();

    expect(log.success).toHaveBeenCalledWith('Configuration updated');
  });

  it('should set AI provider', async () => {
    (select as jest.Mock).mockResolvedValue('set-ai');
    (select as jest.Mock).mockResolvedValueOnce('openai');
    (writeJson as jest.Mock).mockResolvedValue(undefined);

    await config();

    expect(log.success).toHaveBeenCalledWith('Configuration updated');
  });

  it('should reset config', async () => {
    (select as jest.Mock).mockResolvedValue('reset');
    (fileExists as jest.Mock).mockReturnValue(true);
    (confirm as jest.Mock).mockResolvedValue(true);
    (writeJson as jest.Mock).mockResolvedValue(undefined);

    await config();

    expect(log.success).toHaveBeenCalledWith('Global config reset');
  });
});
