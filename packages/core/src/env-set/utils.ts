import { getEnv } from '@silverhand/essentials';

export const getEnvAsStringArray = (envKey: string, fallback: string[] = []): string[] => {
  const rawValue = getEnv(envKey);

  if (!rawValue) {
    return fallback;
  }

  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};
