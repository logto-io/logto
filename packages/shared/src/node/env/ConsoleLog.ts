import chalk from 'chalk';

export default class ConsoleLog {
  static prefixes = Object.freeze({
    info: chalk.bold(chalk.blue('info')),
    warn: chalk.bold(chalk.yellow('warn')),
    error: chalk.bold(chalk.red('error')),
    fatal: chalk.bold(chalk.red('fatal')),
  });

  plain = console.log;

  info: typeof console.log = (...args) => {
    console.log(ConsoleLog.prefixes.info, ...args);
  };

  succeed: typeof console.log = (...args) => {
    this.info(chalk.green('✔'), ...args);
  };

  warn: typeof console.log = (...args) => {
    console.warn(ConsoleLog.prefixes.warn, ...args);
  };

  error: typeof console.log = (...args) => {
    console.error(ConsoleLog.prefixes.error, ...args);
  };

  fatal: (...args: Parameters<typeof console.log>) => never = (...args) => {
    console.error(ConsoleLog.prefixes.fatal, ...args);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  };
}
