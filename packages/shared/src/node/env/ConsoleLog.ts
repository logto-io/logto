import chalk from 'chalk';

export default class ConsoleLog {
  static prefixes = Object.freeze({
    info: chalk.bold(chalk.blue('info')),
    warn: chalk.bold(chalk.yellow('warn')),
    error: chalk.bold(chalk.red('error')),
    fatal: chalk.bold(chalk.red('fatal')),
  });

  constructor(
    public readonly prefix?: string,
    public readonly padding = 8
  ) {}

  plain: typeof console.log = (...args) => {
    console.log(...this.getArgs(args));
  };

  info: typeof console.log = (...args) => {
    this.plain(ConsoleLog.prefixes.info, ...args);
  };

  succeed: typeof console.log = (...args) => {
    this.info(chalk.green('✔'), ...args);
  };

  warn: typeof console.log = (...args) => {
    console.warn(...this.getArgs([ConsoleLog.prefixes.warn, ...args]));
  };

  error: typeof console.log = (...args) => {
    console.error(...this.getArgs([ConsoleLog.prefixes.error, ...args]));
  };

  fatal: (...args: Parameters<typeof console.log>) => never = (...args) => {
    console.error(...this.getArgs([ConsoleLog.prefixes.fatal, ...args]));
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  };

  protected getArgs(args: Parameters<typeof console.log>) {
    if (this.prefix) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return [this.prefix.padEnd(this.padding), ...args];
    }

    return args;
  }
}
