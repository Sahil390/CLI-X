import chalk from 'chalk';

const NO_COLOR = process.env.NO_COLOR || process.env.FORCE_COLOR === '0';
const IS_TTY = process.stdout.isTTY && !NO_COLOR;

function strip(s: string): string {
  // Strip ANSI and common emoji for non-interactive
  return s.replace(/\x1B\[[0-9;]*m/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
}

export const log = {
  info: (msg: string) => { if (IS_TTY) console.error(chalk.blue('ℹ'), msg); else console.error(msg); },
  success: (msg: string) => { if (IS_TTY) console.error(chalk.green('✓'), msg); else console.error(msg); },
  warn: (msg: string) => { if (IS_TTY) console.error(chalk.yellow('⚠'), msg); else console.error(msg); },
  error: (msg: string) => { if (IS_TTY) console.error(chalk.red('✗'), msg); else console.error(msg); },
  title: (msg: string) => { if (IS_TTY) console.error(chalk.bold.cyan('\n' + msg)); else console.error('\n' + msg); },
  dim: (msg: string) => { if (IS_TTY) console.error(chalk.dim(msg)); else console.error(msg); },
  header: (msg: string) => { if (IS_TTY) console.error(chalk.bold.white.bgBlue(' ' + msg + ' ')); else console.error(msg); },
  step: (n: number, msg: string) => { if (IS_TTY) console.error(chalk.gray('  ' + n + '.'), msg); else console.error('  ' + n + '. ' + msg); },
  command: (cmd: string) => { if (IS_TTY) console.error(chalk.green('$'), chalk.white(cmd)); else console.error('$ ' + cmd); },
};

export function machineOutput(data: unknown, pretty = true): void {
  console.log(pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
}

export function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '').replace(/\x1B\][^\x07]*\x07/g, '').replace(/\x1B\[[\?0-9]*[a-zA-Z]/g, '');
}
