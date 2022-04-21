import { assertEnv, getEnv } from '@silverhand/essentials';
import inquirer from 'inquirer';
import { nanoid } from 'nanoid';
import { number, string } from 'zod';

import appendDotEnv from './append-dot-env';

const loadPeppers = async (isTest: boolean): Promise<string[]> => {
  if (isTest) {
    return [nanoid()];
  }

  const key = 'PASSWORD_PEPPERS';

  try {
    return string()
      .array()
      .parse(JSON.parse(assertEnv(key)));
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message === `env variable ${key} not found`)) {
      throw error;
    }

    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: `No password peppers (${key}) found in env variables, would you like to generate a new set and save it into \`.env\`?`,
    });

    if (!answer.confirm) {
      throw error;
    }

    const peppers = [nanoid(), nanoid(), nanoid()];
    appendDotEnv(key, JSON.stringify(peppers));

    return peppers;
  }
};

const loadPasswordValues = async (isTest: boolean) => {
  return Object.freeze({
    peppers: await loadPeppers(isTest),
    iterationCount: number()
      .min(100)
      .parse(Number(getEnv('PASSWORD_ITERATION_COUNT', '1000'))),
  });
};

export default loadPasswordValues;
