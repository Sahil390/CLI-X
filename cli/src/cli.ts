#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { init } from './commands/init.js';
import { build } from './commands/build.js';
import { dev } from './commands/dev.js';
import { deploy } from './commands/deploy.js';
import { login } from './commands/login.js';
import { logout } from './commands/logout.js';
import { ai } from './commands/ai.js';
import { doctorCmd } from './commands/doctor.js';
import { loadConfig } from './utils/config.js';
import { config } from './commands/config.js';
import { templates } from './commands/templates.js';

const __filename = path.resolve('src/cli.ts');
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('website-builder')
  .alias('wb')
  .description('Full-fledged CLI website builder. Quick start: wb init my-site --template default')
  .version('0.1.0')
  .option('--verbose', 'Enable verbose output', false)
  .option('--no-color', 'Disable colored output', false)
  .option('--json', 'Output machine-readable JSON', false)
  .option('--quiet', 'Suppress non-error output', false)
  .showSuggestionAfterError();

function handleError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  const code = (err as any)?.exitCode || (msg.includes('required') ? 2 : 1);
  const out = (program.opts().json ? JSON.stringify({ error: msg, code: 'CLI_ERROR', exitCode: code }) : `Error: ${msg}`);
  console.error(out);
  if (program.opts().verbose && err instanceof Error) console.error(err.stack);
  process.exit(code);
}

program
  .command('init [name]')
  .description('Initialize a new website project. Example: wb init my-blog --template blog')
  .option('-t, --template <template>', 'Template to use (default, blog, portfolio)', 'default')
  .option('--interactive', 'Force interactive prompts', false)
  .action(async (name: string | undefined, options: { template?: string; interactive?: boolean }) => {
    try {
      await init(name, { template: options.template, interactive: options.interactive, json: program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('build')
  .description('Build the site for production. Example: wb build --watch')
  .option('-w, --watch', 'Watch for changes', false)
  .option('--json', 'Output build result as JSON', false)
  .action(async (options: { watch?: boolean; json?: boolean }) => {
    try {
      await build({ watch: options.watch, json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('dev')
  .description('Start development server. Example: wb dev --port 3000 --open')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('--open', 'Open browser', false)
  .option('--json', 'Output server info as JSON', false)
  .action(async (options: { port: string; open?: boolean; json?: boolean }) => {
    try {
      await dev({ port: parseInt(options.port, 10), open: options.open, json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('deploy [target]')
  .description('Deploy the site. Example: wb deploy production --rollback 2')
  .option('--rollback <n>', 'Rollback to deployment N')
  .option('--json', 'Output deploy result as JSON', false)
  .action(async (target: string | undefined, options: { rollback?: string; json?: boolean }) => {
    try {
      await deploy(target, { rollback: options.rollback, json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('login')
  .description('Authenticate with a provider. Example: wb login --provider github')
  .option('-p, --provider <provider>', 'Provider name')
  .option('--json', 'Output login status as JSON', false)
  .action(async (options: { provider?: string; json?: boolean }) => {
    try {
      await login(options.provider, { json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('logout')
  .description('Clear authentication session. Example: wb logout --provider github')
  .option('-p, --provider <provider>', 'Provider name')
  .option('--json', 'Output logout status as JSON', false)
  .action(async (options: { provider?: string; json?: boolean }) => {
    try {
      await logout(options.provider, { json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('ai [prompt]')
  .description('Generate site content with AI. Usage: wb ai "landing page" --style modern --json')
  .option('-s, --style <style>', 'Style preference')
  .option('-t, --template <template>', 'Template to use')
  .option('--interactive', 'Force interactive mode', false)
  .option('--json', 'Output AI result as JSON', false)
  .action(async (prompt: string | undefined, options: { style?: string; template?: string; interactive?: boolean; json?: boolean }) => {
    try {
      if (!prompt && !options.interactive) {
        const msg = 'Error: AI prompt required. Usage: wb ai "your prompt" --json';
        const out = (program.opts().json ? JSON.stringify({ error: msg, code: 'CLI_ERROR' }) : msg);
        console.error(out);
        process.exit(1);
      }
      await ai(prompt || '', { style: options.style, template: options.template, interactive: options.interactive, json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('config [action]')
  .description('View and set configuration. Example: wb config --set key=value')
  .option('--get <key>', 'Get config value')
  .option('--set <key=value>', 'Set config value')
  .option('--json', 'Output config as JSON', false)
  .action(async (action: string | undefined, options: { get?: string; set?: string; json?: boolean }) => {
    try {
      await config({ action, get: options.get, set: options.set, json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('templates [action]')
  .description('Manage and list templates. Example: wb templates list --json')
  .option('--list', 'List available templates')
  .option('--json', 'Output templates as JSON', false)
  .action(async (action: string | undefined, options: { list?: boolean; json?: boolean }) => {
    try {
      await templates(action || (options.list ? 'list' : undefined), { json: options.json || program.opts().json });
    } catch (e) { handleError(e); }
  });

program
  .command('doctor')
  .description('Validate environment. Example: wb doctor')
  .option('--json', 'Output as JSON', false)
  .action(async (options: { json?: boolean }) => {
    try { await doctorCmd().parseAsync(process.argv.slice(2)); } catch (e) { handleError(e); }
  });

program.parse();
