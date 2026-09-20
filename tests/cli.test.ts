import { createCli } from '../src/cli/index';
import { ConfigurationManager } from '../src/application/configuration-manager';

// Migrated from cli/tests/cli.test.ts with updated import paths

describe('CLI-X architecture', () => {
  it('registers all expected commands', () => {
    const cli = createCli();
    const commands = cli.commands.map((command) => command.name());

    expect(commands).toEqual(
      expect.arrayContaining(['create', 'chat', 'build', 'run', 'deploy', 'config', 'doctor'])
    );
  });

  it('exposes typed configuration defaults', () => {
    const config = new ConfigurationManager().getDefaultConfig();

    expect(config.ai).toMatchObject({
      mode: 'cloud',
      provider: 'auto',
      model: 'auto',
    });

    expect(config.deployment).toMatchObject({
      provider: 'local',
    });
  });

  it('loads env var overrides', () => {
    process.env.CLI_X_AI_PROVIDER = 'openai';
    process.env.CLI_X_AI_MODEL = 'gpt-4o';

    const config = new ConfigurationManager().loadGlobal();
    expect(config.ai.provider).toBe('openai');
    expect(config.ai.model).toBe('gpt-4o');

    delete process.env.CLI_X_AI_PROVIDER;
    delete process.env.CLI_X_AI_MODEL;
  });

  it('has correct bin name', () => {
    const cli = createCli();
    expect(cli.name()).toBe('cli-x');
  });
});
