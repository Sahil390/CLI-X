import { Command } from 'commander';
import { ui } from '../ui/logger';
import { ConfigurationManager } from '../../application/configuration-manager';
import { colors } from '../ui/colors';

// ============================================================
// CLI-X — config command
// View and update global + project configuration.
// ============================================================

export function configCommand(): Command {
  const config = new Command('config')
    .description('View or update CLI-X configuration');

  // cli-x config show
  config
    .command('show')
    .description('Display current configuration')
    .action(() => {
      const manager = new ConfigurationManager();
      const cfg = manager.loadGlobal();

      ui.header('CLI-X Configuration');
      ui.blank();
      ui.field('Mode', cfg.ai.mode);
      ui.field('AI Provider', cfg.ai.provider);
      ui.field('AI Model', cfg.ai.model);
      ui.field('Deploy To', cfg.deployment.provider);
      ui.field('Region', cfg.deployment.region ?? 'us-east-1');
      ui.field('Log Level', cfg.ui.logLevel);
      ui.blank();

      // Env var overrides
      const envOverrides = [
        process.env.CLI_X_AI_PROVIDER && `CLI_X_AI_PROVIDER=${process.env.CLI_X_AI_PROVIDER}`,
        process.env.CLI_X_AI_MODEL && `CLI_X_AI_MODEL=${process.env.CLI_X_AI_MODEL}`,
        process.env.AWS_DEFAULT_REGION && `AWS_DEFAULT_REGION=${process.env.AWS_DEFAULT_REGION}`,
      ].filter(Boolean);

      if (envOverrides.length > 0) {
        ui.muted('Active environment overrides:');
        envOverrides.forEach((v) => ui.muted(`  ${v}`));
        ui.blank();
      }
    });

  // cli-x config set <key> <value>
  config
    .command('set <key> <value>')
    .description('Set a configuration value (e.g. cli-x config set ai.provider openai)')
    .action((key: string, value: string) => {
      const manager = new ConfigurationManager();
      const cfg = manager.loadGlobal();

      const keys = key.split('.');
      let current: Record<string, unknown> = cfg as unknown as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof current[keys[i]] !== 'object') {
          ui.error(`Unknown config key: ${key}`);
          return;
        }
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      manager.saveGlobal(cfg);
      ui.success(`Set ${colors.cyan(key)} = ${colors.green(value)}`);
    });

  // Default: show if no subcommand
  config.action(() => {
    const manager = new ConfigurationManager();
    const cfg = manager.loadGlobal();
    console.log(JSON.stringify(cfg, null, 2));
  });

  return config;
}
