import { ArbitraryObject } from '@logto/schemas';

export const safeParseJson = <T extends ArbitraryObject = ArbitraryObject>(
  value: string
): T | undefined => {
  try {
    return JSON.parse(value) as T;
  } catch {}
};
