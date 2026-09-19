import { ai } from '../../src/commands/ai';
import { HttpApiClient } from '../../src/bridge/http-api';
import { callPython } from '../../src/bridge/python';
import { log } from '../../src/ui/logger';
import { createSpinner, stopWithSuccess, stopWithFailure } from '../../src/ui/spinner';
import { projectRoot } from '../../src/utils/path';
import fse from 'fs-extra';

jest.mock('../../src/bridge/http-api');
jest.mock('../../src/bridge/python');
jest.mock('../../src/utils/path', () => ({
  projectRoot: jest.fn(() => '/fake'),
}));
jest.mock('fs-extra');
jest.mock('../../src/ui/logger');
jest.mock('../../src/ui/spinner', () => ({
  createSpinner: jest.fn(() => ({ start: jest.fn(), succeed: jest.fn(), fail: jest.fn() })),
  stopWithSuccess: jest.fn(),
  stopWithFailure: jest.fn(),
}));

describe('ai', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use API when available', async () => {
    (HttpApiClient as jest.Mock).mockImplementation(() => ({
      isAvailable: jest.fn().mockResolvedValue(true),
      generate: jest.fn().mockResolvedValue({
        html: '<html></html>',
        css: 'body{}',
        js: 'console.log("hi");',
      }),
    }));
    (fse.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fse.writeFile as jest.Mock).mockResolvedValue(undefined);

    await ai('a landing page');

    expect(HttpApiClient).toHaveBeenCalled();
    expect(stopWithSuccess).toHaveBeenCalled();
  });

  it('should fall back to subprocess when API unavailable', async () => {
    (HttpApiClient as jest.Mock).mockImplementation(() => ({
      isAvailable: jest.fn().mockResolvedValue(false),
    }));
    (callPython as jest.Mock).mockResolvedValue({
      success: true,
      data: { files: { 'index.html': '<html></html>' } },
    });
    (fse.ensureDir as jest.Mock).mockResolvedValue(undefined);
    (fse.writeFile as jest.Mock).mockResolvedValue(undefined);

    await ai('a landing page');

    expect(callPython).toHaveBeenCalledWith({
      modulePath: 'backend.ai.generator',
      args: ['--prompt', 'a landing page', '--output', '/fake/src'],
      timeout: 120000,
    });
    expect(stopWithSuccess).toHaveBeenCalled();
  });

  it('should handle AI generation failure', async () => {
    (HttpApiClient as jest.Mock).mockImplementation(() => ({
      isAvailable: jest.fn().mockResolvedValue(true),
      generate: jest.fn().mockResolvedValue({ error: 'API error' }),
    }));

    await ai('a landing page');

    expect(stopWithFailure).toHaveBeenCalled();
  });

  it('should warn when no prompt is provided', async () => {
    await ai(undefined as any);

    expect(log.warn).toHaveBeenCalled();
  });
});
