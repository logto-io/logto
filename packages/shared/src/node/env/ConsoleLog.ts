import chalk from 'chalk';

export default class ConsoleLog {
  plain = console.log;

  info: typeof console.log = (...args) => {
    console.log(chalk.bold(chalk.blue('info')), ...args);
  };

  succeed: typeof console.log = (...args) => {
    this.info(chalk.green('✔'), ...args);
  };

  warn: typeof console.log = (...args) => {
    console.warn(chalk.bold(chalk.yellow('warn')), ...args);
  };

  error: typeof console.log = (...args) => {
    console.error(chalk.bold(chalk.red('error')), ...args);
  };

  fatal: (...args: Parameters<typeof console.log>) => never = (...args) => {
    console.error(chalk.bold(chalk.red('fatal')), ...args);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  };
}
