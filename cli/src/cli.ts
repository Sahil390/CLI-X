#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { build } from './commands/build.js';
import { dev } from './commands/dev.js';
import { deploy } from './commands/deploy.js';
import { login } from './commands/login.js';
import { logout } from './commands/logout.js';
import { ai } from './commands/ai.js';
import { config } from './commands/config.js';
import { templates } from './commands/templates.js';
import { log } from './ui/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name('website-builder')
  .alias('wb')
  .description('Full-fledged CLI website builder')
  .version('0.1.0')
  .option('--verbose', 'Enable verbose output', false)
  .option('--no-color', 'Disable colored output', false);

program
  .command('init [name]')
  .description('Initialize a new website project')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(async (name: string | undefined, options: { template?: string }) => {
    await init(name);
  });

program
  .command('build')
  .description('Build the site for production')
  .option('-w, --watch', 'Watch for changes')
  .action(async (options: { watch?: boolean }) => {
    await build();
  });

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('--open', 'Open browser', false)
  .action(async (options: { port: string; open?: boolean }) => {
    await dev({ port: parseInt(options.port, 10) });
  });

program
  .command('deploy [target]')
  .description('Deploy the site')
  .option('--rollback <n>', 'Rollback to deployment N')
  .action(async (target: string | undefined, options: { rollback?: string }) => {
    await deploy(target);
  });

program
  .command('login')
  .description('Authenticate with a provider')
  .option('-p, --provider <provider>', 'Provider name')
  .action(async (options: { provider?: string }) => {
    await login(options.provider);
  });

program
  .command('logout')
  .description('Clear authentication session')
  .option('-p, --provider <provider>', 'Provider name')
  .action(async (options: { provider?: string }) => {
    await logout(options.provider);
  });

program
  .command('ai [prompt]')
  .description('Generate site content with AI')
  .option('-s, --style <style>', 'Style preference')
  .option('-t, --template <template>', 'Template to use')
  .action(async (prompt: string | undefined, options: { style?: string; template?: string }) => {
    if (!prompt) {
      log.warn('Please provide a prompt: wb ai "a landing page for my site"');
      return;
    }
    await ai(prompt, { style: options.style, template: options.template });
  });

program
  .command('config')
  .description('View and set configuration')
  .action(async () => {
    await config();
  });

program
  .command('templates [action]')
  .description('Manage and list templates')
  .action(async (action: string | undefined) => {
    await templates(action);
  });

program.parse();
