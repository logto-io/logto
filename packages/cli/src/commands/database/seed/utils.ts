import type { IdFormat } from '@logto/shared';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { consoleLog } from '../../../utils.js';

import type { IdFormatConfig } from './index.js';

/**
 * Prompt the user to select ID format for all entity types.
 * This is used during database seeding to configure the default ID format for the tenant.
 */
export const promptIdFormats = async (): Promise<IdFormatConfig> => {
  consoleLog.info(
    '\n' +
      chalk.bold('ID Format Configuration') +
      '\n\n' +
      'Logto supports two ID formats:\n' +
      `  • ${chalk.green('nanoid')} - Compact, URL-safe IDs (12-21 characters, e.g., "a1b2c3d4e5f6")\n` +
      `  • ${chalk.magenta('uuidv7')} - UUID v7 format (36 characters, time-ordered, e.g., "018e8c3a-9d2e-7890-a123-456789abcdef")\n\n` +
      chalk.yellow('Note:') +
      ' This configuration can be changed later via the Management API.\n' +
      chalk.yellow('Tip:') +
      ' UUID v7 provides better database performance due to time-ordering.\n'
  );

  const { format } = await inquirer.prompt<{ format: IdFormat }>({
    type: 'list',
    name: 'format',
    message: 'Select ID format for all entities (users, organizations, roles):',
    choices: [
      {
        name: `${chalk.green('nanoid')} - Compact, URL-safe`,
        value: 'nanoid',
      },
      {
        name: `${chalk.magenta('uuidv7')} - UUID v7`,
        value: 'uuidv7',
      },
    ],
    default: 'nanoid',
  });

  consoleLog.info(`\n${chalk.bold('Selected ID format:')} ${chalk.green(format)}\n`);

  return { idFormat: format };
};
