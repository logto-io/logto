import { GeneratedSchema, SchemaLike } from '@logto/schemas';

export const isKeyOf =
  <Schema extends SchemaLike>({ fieldKeys }: GeneratedSchema<Schema>) =>
  (key: string): key is keyof Schema extends string ? keyof Schema : never =>
    fieldKeys.includes(key);
