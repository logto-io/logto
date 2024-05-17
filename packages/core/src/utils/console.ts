import { ConsoleLog } from '@logto/shared';
import { noop } from '@silverhand/essentials';
import chalk from 'chalk';

import { EnvSet } from '#src/env-set/index.js';

export class SilentConsoleLog extends ConsoleLog {
  plain = noop;
  info = noop;
  succeed = noop;
  warn = noop;
  error = noop;
  fatal = () => {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  };
}

/** The fallback console log with `unknown` prefix. */
export const unknownConsole: ConsoleLog = new ConsoleLog(chalk.yellow('unknown'));

/**
 * The development console log with `dev` prefix. Usually you should use context-aware console log
 * instead of this.
 */
export const devConsole: ConsoleLog = new ConsoleLog(chalk.magenta('dev'));

/**
 * Try to get the `ConsoleLog` instance from the context by checking if the `console` property is
 * an instance of `ConsoleLog`. If it is not:
 *
 * - In production, return the default console log with `unknown` prefix.
 * - In development or testing, throw an error.
 *
 * The in-context console log is used to provide a more context-aware logging experience.
 */
// eslint-disable-next-line @typescript-eslint/ban-types -- We need to accept any object as context
export const getConsoleLogFromContext = (context: object): ConsoleLog => {
  if ('console' in context && context.console instanceof ConsoleLog) {
    return context.console;
  }

  // In production or unit testing, we should safely return an instance of `ConsoleLog`
  if (!EnvSet.values.isProduction && !EnvSet.values.isUnitTest) {
    throw new Error('Failed to get console log from context, please provide a valid context.');
  }

  if (EnvSet.values.isUnitTest) {
    return new SilentConsoleLog();
  }

  unknownConsole.warn(
    'Failed to get console log from context, returning the unknown-prefixed `ConsoleLog`.'
  );
  return unknownConsole;
};
