import chalk from 'chalk';

export default class ConsoleLog {
  static prefixes = Object.freeze({
    info: chalk.bold(chalk.blue('info')),
    warn: chalk.bold(chalk.yellow('warn')),
    error: chalk.bold(chalk.red('error')),
    fatal: chalk.bold(chalk.red('fatal')),
  });

  constructor(
    /** A prefix to prepend to all log messages. */
    public readonly prefix?: string,
    /**
     * The number of spaces to pad the prefix. For example, if the prefix is `custom` and the
     * padding is 8, the output will be `custom  `.
     *
     * @default 8
     */
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
