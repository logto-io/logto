import { appendFileSync } from 'fs';

import dotenv from 'dotenv';

import { fromRoot } from './parameters';

export const appendDotEnv = (key: string, value: string) => {
  appendFileSync('.env', `${key}=${value}\n`);
};

export const configDotEnv = () => {
  // Started from project root, change working directory
  if (fromRoot) {
    process.chdir('../..');
  }

  dotenv.config();
};
