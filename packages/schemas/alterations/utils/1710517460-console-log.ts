// Edited from `@logto/shared`.
export default class ConsoleLog {
  static prefixes = Object.freeze({
    info: '[info]',
    warn: '[warn]',
    error: '[error]',
    fatal: '[fatal]',
  });

  plain = console.log;

  info: typeof console.log = (...args) => {
    console.log(ConsoleLog.prefixes.info, ...args);
  };

  succeed: typeof console.log = (...args) => {
    this.info('✔', ...args);
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
