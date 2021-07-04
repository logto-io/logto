import assert from 'assert';

export const getEnv = (key: string, fallback = ''): string => process.env[key] ?? fallback;
export const assertEnv = (key: string): string => {
  const value = process.env[key];
  assert(value, `env variable ${key} not found`);
  return value;
};
