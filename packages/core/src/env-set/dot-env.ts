import { appendFileSync } from 'fs';

import dotenv from 'dotenv';
import findUp from 'find-up';

export const appendDotEnv = (key: string, value: string) => {
  appendFileSync('.env', `${key}=${value}\n`);
};

export const configDotEnv = async () => {
  dotenv.config({ path: await findUp('.env', {}) });
};
