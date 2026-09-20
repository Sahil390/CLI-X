import { Command } from 'commander';
import * as readline from 'readline';
import { ui } from '../ui/logger';
import { SessionManager } from '../../application/session-manager';
import { ProjectManager } from '../../application/project-manager';
import { ChatHistory } from '../../project/chat-history';
import { colors } from '../ui/colors';

// ============================================================
// CLI-X — chat command
// Persistent AI conversation loop with .ai/chat/messages.jsonl
// ============================================================

export function chatCommand(): Command {
  return new Command('chat')
    .argument('[message]', 'Initial message to send')
    .option('-p, --project <path>', 'Project root directory', process.cwd())
    .description('Start or continue a persistent project chat session')
    .action(async (message: string | undefined, options: { project: string }) => {
      await startChatSession(message, options);
    });
}

export async function startChatSession(message: string | undefined, options: { project: string }): Promise<void> {
  const projectRoot = options.project;
  const session = new SessionManager();
  const history = new ChatHistory(projectRoot);

  // Try to bind to project
  try {
    const manager = new ProjectManager();
    await manager.detectProject(projectRoot);
    await session.bindProject(projectRoot);
    await history.initialize();

    const count = await history.count();
    if (count > 0) {
      ui.muted(`Resuming conversation (${count} messages in history)`);
    } else {
      ui.muted('Starting new conversation');
    }
  } catch {
    ui.warning('No project detected — running in ephemeral mode (no persistence)');
  }

  ui.blank();

  // If a message was provided as an argument, handle it inline
  if (message) {
    await handleMessage(message, session);
    return;
  }

  // Interactive REPL mode
  ui.info('CLI-X Chat — type your message, or "done" to exit development mode');
  ui.muted('Chat history is persisted to .ai/chat/messages.jsonl');
  ui.blank();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    process.stdout.write(`${colors.boldPurple('you')}${colors.dim(' › ')} `);
  };

  prompt();
  
  // We return a promise that resolves when the user types 'done'
  return new Promise((resolve) => {
    rl.on('line', async (line) => {
      const input = line.trim();
      if (!input) { prompt(); return; }
      if (input === 'exit' || input === 'quit' || input === 'done') {
        ui.muted('Exiting chat...');
        rl.close();
        resolve();
        return;
      }
      await handleMessage(input, session);
      prompt();
    });
  });
}

async function handleMessage(message: string, session: SessionManager): Promise<void> {
  await session.addMessage('user', message);

  // Mock AI response — Step 5 wires real model
  const response = `[CLI-X] I understand: "${message}". Full AI response requires model configuration (Step 5).`;
  await session.addMessage('assistant', response);

  ui.blank();
  process.stdout.write(`${colors.boldGreen('cli-x')}${colors.dim(' › ')} `);
  console.log(colors.white(response));
  ui.blank();
}
