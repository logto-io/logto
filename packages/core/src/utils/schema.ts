import type { GeneratedSchema, SchemaLike } from '@logto/schemas';

export const isKeyOf =
  <CreateSchema extends SchemaLike, Schema extends CreateSchema>({
    fieldKeys,
  }: GeneratedSchema<CreateSchema, Schema>) =>
  (key: string): key is keyof Schema extends string ? keyof Schema : never =>
    fieldKeys.includes(key);
