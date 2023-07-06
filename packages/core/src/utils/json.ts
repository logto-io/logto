import { trySafe } from '@silverhand/essentials';

export const safeParseJson = (jsonString: string): unknown =>
  // eslint-disable-next-line no-restricted-syntax
  trySafe(() => JSON.parse(jsonString) as unknown);
