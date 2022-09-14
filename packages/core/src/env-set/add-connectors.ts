import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

import inquirer from 'inquirer';

import { addOfficialConnectors } from '@/connectors/add-connectors';

import { allYes } from './parameters';

export const addConnectors = async (directory: string) => {
  if (existsSync(directory)) {
    return;
  }

  if (!allYes) {
    const add = await inquirer.prompt({
      type: 'confirm',
      name: 'value',
      message: `Would you like to add built-in connectors?`,
    });

    if (!add.value) {
      await mkdir(directory);

      return;
    }
  }

  await addOfficialConnectors(directory);
};
