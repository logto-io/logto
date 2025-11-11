import chalk from 'chalk';
import inquirer from 'inquirer';

import { consoleLog } from '../../../utils.js';

/**
 * Prompt the user to select ID format for all entity types.
 * This is used during database seeding to configure the ID format for the instance.
 *
 * @returns The selected format string ('nanoid' or 'uuid')
 */
export const promptIdFormat = async (): Promise<string> => {
  consoleLog.info(
    '\n' +
      chalk.bold('ID Format Configuration') +
      '\n\n' +
      'Logto supports two ID formats:\n' +
      `  ${chalk.green('nanoid')} - Compact, URL-safe IDs (12-21 characters, e.g., "a1b2c3d4e5f6")\n` +
      `  ${chalk.magenta('uuid')} - UUID v7 format (36 characters, time-ordered, e.g., "018e8c3a-9d2e-7890-a123-456789abcdef")\n\n` +
      chalk.red('Warning:') +
      ' This choice is permanent and cannot be changed after installation.\n' +
      chalk.yellow('Tip:') +
      ' Set the ID_FORMAT environment variable to skip this prompt.\n'
  );

  const { format } = await inquirer.prompt<{ format: string }>({
    type: 'list',
    name: 'format',
    message: 'Select ID format for all entities (users, organizations, roles):',
    choices: [
      {
        name: `${chalk.green('nanoid')} - Compact, URL-safe`,
        value: 'nanoid',
      },
      {
        name: `${chalk.magenta('uuid')} - UUID v7`,
        value: 'uuid',
      },
    ],
    default: 'nanoid',
  });

  consoleLog.info(`\n${chalk.bold('Selected ID format:')} ${chalk.green(format)}\n`);

  return format;
};
