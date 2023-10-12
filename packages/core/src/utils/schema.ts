import type { GeneratedSchema, SchemaLike } from '@logto/schemas';

export const isKeyOf =
  <
    Key extends string,
    CreateSchema extends Partial<SchemaLike<Key>>,
    Schema extends SchemaLike<Key>,
  >({
    fieldKeys,
  }: GeneratedSchema<Key, CreateSchema, Schema>) =>
  (key: string): key is Key =>
    // eslint-disable-next-line no-restricted-syntax -- the quickest way to check
    fieldKeys.includes(key as Key);
