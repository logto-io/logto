import type { User as RawUser } from '@logto/schemas';

// To avoid "Error TS2589: Type instantiation is excessively deep and possibly infinite." error since JsonObject is a recursive type.
export type User = Omit<RawUser, 'customData'> & {
  customData: Record<string, unknown>;
};
