import { Command } from 'commander';
import { renderBanner } from './ui/banner';
import { ui } from './ui/logger';
import { createCommand } from './commands/create';
import { chatCommand } from './commands/chat';
import { buildCommand } from './commands/build';
import { runCommand } from './commands/run';
import { deployCommand } from './commands/deploy';
import { configCommand } from './commands/config';
import { doctorCommand } from './commands/doctor';

// ============================================================
// CLI-X — CLI Factory
// Registers all commands with Commander.
// ============================================================

export function createCli(): Command {
  const program = new Command();

  program
    .name('cli-x')
    .description('AI-Native CLI Development Agent')
    .version('0.1.0')
    .addHelpText('after', `
Examples:
  $ cli-x create my-site --template react
  $ cli-x chat "add a dark mode toggle"
  $ cli-x run --port 3000
  $ cli-x build --repair
  $ cli-x deploy local
  $ cli-x doctor
`);

  // Print banner before every command
  program.hook('preAction', () => {
    process.stdout.write(renderBanner());
    ui.separator();
    ui.blank();
  });

  // Register all commands
  program.addCommand(createCommand());
  program.addCommand(chatCommand());
  program.addCommand(buildCommand());
  program.addCommand(runCommand());
  program.addCommand(deployCommand());
  program.addCommand(configCommand());
  program.addCommand(doctorCommand());

  // Default interactive action
  program.action(async () => {
    // If commands were passed but not matched, Commander handles it via unknown command error.
    // If no arguments at all, we launch the interactive orchestrator.
    const { InteractiveOrchestrator } = await import('./interactive/orchestrator');
    const orchestrator = new InteractiveOrchestrator();
    await orchestrator.run();
  });

  return program;
}
