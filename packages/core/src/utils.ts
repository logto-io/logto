import assert from 'assert';

export type Optional<T> = T | undefined;
export type Falsy = 0 | undefined | null | false | '';

export const conditional = <T>(value: T | Falsy): Optional<T> => (value ? value : undefined);
export const conditionalString = (value: string | Falsy): string => (value ? value : '');

export const getEnv = (key: string, fallback = ''): string => process.env[key] ?? fallback;
export const assertEnv = (key: string): string => {
  const value = process.env[key];
  assert(value, `env variable ${key} not found`);
  return value;
};
