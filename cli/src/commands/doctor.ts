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
        openai_key: false,
      };
      try { require('child_process').execSync('python3 --version'); checks.python = true; } catch {}
      checks.openai_key = !!process.env.OPENAI_API_KEY;
      try { loadConfig(); checks.config = true; } catch {}
      const ok = checks.node && checks.config && checks.openai_key;
      const result = { status: ok ? 'ok' : 'fail', checks };
      const msg = 'Doctor: ' + (ok ? 'PASS' : 'FAIL') + (checks.python ? '' : ' (python missing)') + (!checks.openai_key ? ' (OPENAI_API_KEY missing)' : '');
      if (options.json) console.log(JSON.stringify(result)); else console.error(msg);
      process.exit(ok ? 0 : 2);
    });
}
