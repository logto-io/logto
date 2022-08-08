import { getEnv } from '@silverhand/essentials';

class EnvParseError extends Error {
  constructor(envKey: string, errorMessage: string) {
    super(`Failed to parse env \`${envKey}\`: ${errorMessage}`);
  }
}

class InvalidStringArrayValueError extends Error {
  message = 'the value should be an array of strings.';
}

// TODO: LOG-3870 - Add `getEnvAsStringArray` to `@silverhand/essentials`
export const getEnvAsStringArray = (envKey: string, fallback: string[] = []): string[] => {
  const rawValue = getEnv(envKey);

  if (!rawValue) {
    return fallback;
  }

  try {
    return convertEnvToStringArray(rawValue);
  } catch (error: unknown) {
    if (error instanceof InvalidStringArrayValueError) {
      throw new EnvParseError(envKey, error.message);
    }
    throw error;
  }
};

const convertEnvToStringArray = (value: string): string[] => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let values: unknown;

  try {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    values = JSON.parse(value);
  } catch {
    throw new InvalidStringArrayValueError();
  }

  if (
    !Array.isArray(values) ||
    !values.every((value): value is string => typeof value === 'string')
  ) {
    throw new InvalidStringArrayValueError();
  }

  return values;
};
