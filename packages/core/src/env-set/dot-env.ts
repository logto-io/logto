import { appendFileSync } from 'fs';

import dotenv from 'dotenv';

import { fromRoot } from './parameters';

export const appendDotEnv = (key: string, value: string) => {
  appendFileSync('.env', `${key}=${value}\n`);
};

export const configDotEnv = () => {
  if (fromRoot) {
    dotenv.config({ path: '../../.env' });
  } else {
    dotenv.config();
  }
};
