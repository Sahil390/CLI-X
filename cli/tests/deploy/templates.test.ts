import { templates } from '../../src/commands/templates';
import { log } from '../../src/ui/logger';
import { readdir, fileExists } from '../../src/utils/fs';

jest.mock('../../src/ui/logger');
jest.mock('../../src/utils/fs');

describe('templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list built-in templates when no action', async () => {
    (fileExists as jest.Mock).mockResolvedValue(false);

    await templates();

    expect(log.success).toHaveBeenCalledWith('Built-in templates:');
  });

  it('should list custom templates when they exist', async () => {
    (fileExists as jest.Mock).mockResolvedValue(true);
    (readdir as jest.Mock).mockResolvedValue(['custom1', 'custom2']);

    await templates();

    expect(log.success).toHaveBeenCalledWith('Built-in templates:');
    expect(log.info).toHaveBeenCalledWith('Custom templates:');
  });

  it('should warn for unknown action', async () => {
    await templates('unknown-action');

    expect(log.warn).toHaveBeenCalledWith('Unknown action: unknown-action');
  });

  it('should suggest wb init for create action', async () => {
    await templates('create');

    expect(log.info).toHaveBeenCalledWith('Use wb init <name> with a template to create a new project.');
  });
});
