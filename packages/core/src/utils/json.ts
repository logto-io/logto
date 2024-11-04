import { type JsonObject, jsonObjectGuard } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';

export const safeParseJson = (jsonString: string): unknown =>
  // eslint-disable-next-line no-restricted-syntax
  trySafe(() => JSON.parse(jsonString) as unknown);

// Safely parse Zod unknown JSON object to JsonObject
export const safeParseUnknownJson = (unknownJson: Record<string, unknown>): JsonObject =>
  trySafe(
    () =>
      jsonObjectGuard.safeParse(
        cleanDeep(unknownJson, {
          emptyArrays: false,
          emptyObjects: false,
          emptyStrings: false,
          nullValues: false,
        })
      ).data
  ) ?? {};
