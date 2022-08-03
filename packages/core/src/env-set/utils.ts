import { getEnv } from '@silverhand/essentials';

class EnvParseError extends Error {}
class InvalidValueFormatError extends Error {}

// TODO: LOG-3870 - Add `getEnvAsStringArray` to `@silverhand/essentials`
export const getEnvAsStringArray = (envKey: string, fallback: string[] = []): string[] => {
  const rawValue = getEnv(envKey);

  if (!rawValue) {
    return fallback;
  }

  try {
    return convertEnvToStringArray(rawValue);
  } catch (error: unknown) {
    if (error instanceof InvalidValueFormatError) {
      throw new EnvParseError(`Failed to parse env \`${envKey}\`: ${error.message}`);
    }
    throw error;
  }
};

const convertEnvToStringArray = (value: string): string[] => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let values: unknown;

  const invalidValueFormatMessage = 'the value should be an array of strings.';

  try {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    values = JSON.parse(value);
  } catch {
    throw new InvalidValueFormatError(invalidValueFormatMessage);
  }

  if (
    !Array.isArray(values) ||
    !values.every((value): value is string => typeof value === 'string')
  ) {
    throw new InvalidValueFormatError(invalidValueFormatMessage);
  }

  return values;
};
