import { Command } from 'commander';
import { loadConfig } from '../utils/config.js';

export function doctorCmd(): Command {
  return new Command('doctor')
    .description('Validate environment and print fixes')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const checks = {
        node: process.version.startsWith('v'),
        python: false,
        config: false,
        templates: false,
      };
      try { require('child_process').execSync('python3 --version'); checks.python = true; } catch {}
      try { loadConfig(); checks.config = true; } catch {}
      const ok = checks.node && checks.config;
      const result = { status: ok ? 'ok' : 'fail', checks };
      if (options.json) console.log(JSON.stringify(result)); else console.error('Doctor: ' + (ok ? 'PASS' : 'FAIL') + (checks.python ? '' : ' (python missing)'));
      process.exit(ok ? 0 : 2);
    });
}
