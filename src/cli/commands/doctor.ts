import { Command } from 'commander';
import { ui } from '../ui/logger';
import { ShellTool } from '../../tools/shell';
import { colors } from '../ui/colors';

// ============================================================
// CLI-X — doctor command
// Environment health check: Node, npm, Git, AWS, TypeScript.
// ============================================================

interface HealthCheck {
  name: string;
  required: boolean;
  check: () => Promise<{ ok: boolean; version?: string; message?: string }>;
}

const CHECKS: HealthCheck[] = [
  {
    name: 'Node.js',
    required: true,
    check: async () => {
      const version = await ShellTool.getVersion('node');
      if (!version) return { ok: false, message: 'Node.js not found on PATH' };
      const major = parseInt(version.replace('v', '').split('.')[0], 10);
      const ok = major >= 18;
      return {
        ok,
        version,
        message: ok ? undefined : `Node.js v18+ required, found ${version}`,
      };
    },
  },
  {
    name: 'npm',
    required: true,
    check: async () => {
      const version = await ShellTool.getVersion('npm');
      if (!version) return { ok: false, message: 'npm not found on PATH' };
      return { ok: true, version };
    },
  },
  {
    name: 'Git',
    required: false,
    check: async () => {
      const version = await ShellTool.getVersion('git');
      if (!version) return { ok: false, message: 'Git not found on PATH' };
      return { ok: true, version };
    },
  },
  {
    name: 'TypeScript (tsc)',
    required: false,
    check: async () => {
      const result = await ShellTool.run('npx', ['tsc', '--version']);
      if (result.exitCode !== 0) return { ok: false, message: 'tsc not available via npx' };
      return { ok: true, version: result.stdout.trim() };
    },
  },
  {
    name: 'AWS CLI',
    required: false,
    check: async () => {
      const version = await ShellTool.getVersion('aws');
      if (!version) return { ok: false, message: 'AWS CLI not installed (optional for deployment)' };
      return { ok: true, version };
    },
  },
  {
    name: 'AWS Credentials',
    required: false,
    check: async () => {
      const hasKey = !!process.env.AWS_ACCESS_KEY_ID;
      const hasProfile = !!process.env.AWS_PROFILE;
      const ok = hasKey || hasProfile;
      return {
        ok,
        message: ok
          ? `Credentials detected (${hasKey ? 'env vars' : 'profile'})`
          : 'No AWS credentials detected (optional for Bedrock/Amplify)',
      };
    },
  },
];

export function doctorCommand(): Command {
  return new Command('doctor')
    .description('Check environment readiness for CLI-X')
    .option('--json', 'Output results as JSON')
    .action(async (options: { json: boolean }) => {
      if (!options.json) {
        ui.header('CLI-X Environment Doctor');
        ui.blank();
      }

      const results: Array<{ name: string; ok: boolean; required: boolean; version?: string; message?: string }> = [];

      for (const check of CHECKS) {
        const result = await check.check();
        results.push({ name: check.name, required: check.required, ...result });

        if (!options.json) {
          if (result.ok) {
            const ver = result.version ? colors.dim(` (${result.version})`) : '';
            console.log(`  ${colors.boldGreen('✓')} ${check.name}${ver}`);
          } else {
            const sym = check.required ? colors.boldRed('✕') : colors.boldYellow('★');
            const msg = result.message ?? 'Not available';
            console.log(`  ${sym} ${check.name} ${colors.dim(`— ${msg}`)}`);
          }
        }
      }

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      ui.blank();

      const failed = results.filter((r) => r.required && !r.ok);
      const optional = results.filter((r) => !r.required && !r.ok);

      if (failed.length === 0) {
        ui.success('All required checks passed');
        if (optional.length > 0) {
          ui.muted(`${optional.length} optional component(s) not found`);
        }
      } else {
        ui.error(`${failed.length} required check(s) failed`);
        failed.forEach((f) => ui.error(`  ${f.name}: ${f.message}`));
        process.exit(1);
      }

      ui.blank();
      ui.field('Runtime', 'Node.js / TypeScript only');
      ui.field('Python', colors.boldGreen('✓ Not required (removed)'));
      ui.blank();
    });
}
