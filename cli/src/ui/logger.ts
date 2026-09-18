import chalk from 'chalk';

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  title: (msg: string) => console.log(chalk.bold.cyan('\n' + msg)),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  header: (msg: string) => console.log(chalk.bold.white.bgBlue(' ' + msg + ' ')),

  step: (n: number, msg: string) => console.log(chalk.gray(`  ${n}.`), msg),
  command: (cmd: string) => console.log(chalk.green('$'), chalk.white(cmd)),
};
