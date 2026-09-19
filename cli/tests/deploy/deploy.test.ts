import { deploy } from '../../src/commands/deploy';
import { callPython } from '../../src/bridge/python';
import { log } from '../../src/ui/logger';
import { readJson, fileExists } from '../../src/utils/fs';
import { resolveConfigPath, projectRoot } from '../../src/utils/path';
import { createSpinner, stopWithSuccess, stopWithFailure } from '../../src/ui/spinner';

jest.mock('../../src/bridge/python');
jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/path', () => ({
  resolveConfigPath: jest.fn(() => '/fake/website-builder.config.json'),
  projectRoot: jest.fn(() => '/fake'),
}));
jest.mock('../../src/ui/logger');
jest.mock('../../src/ui/spinner', () => ({
  createSpinner: jest.fn(() => ({ start: jest.fn(), succeed: jest.fn(), fail: jest.fn() })),
  stopWithSuccess: jest.fn(),
  stopWithFailure: jest.fn(),
}));

describe('deploy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deploy with explicit target', async () => {
    (callPython as jest.Mock).mockResolvedValue({
      success: true,
      data: { success: true, url: 'http://localhost:3000' },
    });
    (fileExists as jest.Mock).mockResolvedValue(false);

    await deploy('vercel');

    expect(callPython).toHaveBeenCalledWith({
      modulePath: 'backend.deploy.orchestrator',
      args: ['--target', 'vercel', '--config', '/fake/website-builder.config.json'],
    });
    expect(stopWithSuccess).toHaveBeenCalled();
  });

  it('should fall back to config target when no target given', async () => {
    (readJson as jest.Mock).mockResolvedValue({
      deploy: { target: 'github' },
    });
    (fileExists as jest.Mock).mockResolvedValue(true);
    (callPython as jest.Mock).mockResolvedValue({
      success: true,
      data: { success: true, url: 'https://user.github.io/repo' },
    });

    await deploy();

    expect(callPython).toHaveBeenCalledWith({
      modulePath: 'backend.deploy.orchestrator',
      args: ['--target', 'github', '--config', '/fake/website-builder.config.json'],
    });
  });

  it('should default to local when no target and no config', async () => {
    (fileExists as jest.Mock).mockResolvedValue(false);
    (callPython as jest.Mock).mockResolvedValue({
      success: true,
      data: { success: true, url: '/fake/dist' },
    });

    await deploy();

    expect(callPython).toHaveBeenCalledWith({
      modulePath: 'backend.deploy.orchestrator',
      args: ['--target', 'local', '--config', '/fake/website-builder.config.json'],
    });
  });

  it('should handle deploy failure', async () => {
    (fileExists as jest.Mock).mockResolvedValue(false);
    (callPython as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Deploy failed',
    });

    await deploy();

    expect(stopWithFailure).toHaveBeenCalled();
    expect(log.error).toHaveBeenCalled();
  });
});
