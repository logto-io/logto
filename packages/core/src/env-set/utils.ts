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

export const checkDeprecatedEnv = (deprecatedEnv: string, newEnv: string, example: string) => {
  if (getEnv(deprecatedEnv)) {
    throw new Error(
      `The env \`${deprecatedEnv}\` is deprecated, please use \`${newEnv}\` instead.\nE.g.${example}`
    );
  }
};
