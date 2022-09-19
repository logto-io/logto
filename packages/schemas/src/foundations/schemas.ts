import { ZodObject, ZodType, ZodOptional } from 'zod';

type ParseOptional<K> = undefined extends K
  ? ZodOptional<ZodType<Exclude<K, undefined>>>
  : ZodType<K>;

export type CreateGuard<T extends Record<string, unknown>> = ZodObject<{
  [key in keyof T]-?: ParseOptional<T[key]>;
}>;

export type Guard<T extends Record<string, unknown>> = ZodObject<{
  [key in keyof T]: ZodType<T[key]>;
}>;

export type SchemaValuePrimitive = string | number | boolean | undefined;
export type SchemaValue = SchemaValuePrimitive | Record<string, unknown> | unknown[] | null;
export type SchemaLike<Key extends string = string> = {
  [key in Key]: SchemaValue;
};

export type GeneratedSchema<Schema extends SchemaLike> = keyof Schema extends string
  ? Readonly<{
      table: string;
      tableSingular: string;
      fields: {
        [key in keyof Required<Schema>]: string;
      };
      fieldKeys: ReadonlyArray<keyof Schema>;
      createGuard: CreateGuard<Schema>;
      guard: Guard<Schema>;
    }>
  : never;
