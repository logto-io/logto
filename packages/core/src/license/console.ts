import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';

/**
 * The console log for everything license-related.
 *
 * A license problem is an operator problem — a key that no longer verifies silently drops the
 * instance back to the self-hosted defaults — so it is reported under its own prefix rather than
 * the generic `dev` one, and it is printed in production too.
 */
export const licenseConsoleLog: ConsoleLog = new ConsoleLog(chalk.magenta('license'));
