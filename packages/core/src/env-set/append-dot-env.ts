import { appendFileSync } from 'fs';

const appendDotEnv = (key: string, value: string) => {
  appendFileSync('.env', `${key}=${value}\n`);
};

export default appendDotEnv;
