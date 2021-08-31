import assert from '@/utils/assert';

export const getEnv = (key: string, fallback = ''): string => process.env[key] ?? fallback;
export const assertEnv = (key: string): string => {
  const value = process.env[key];
  assert(value, new Error(`env variable ${key} not found`));
  return value;
};
