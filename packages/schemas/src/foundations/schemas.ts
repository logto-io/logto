import { ZodObject, ZodType, ZodOptional } from 'zod';

export type Guard<T extends Record<string, unknown>> = ZodObject<
  {
    [key in keyof T]-?: undefined extends T[key]
      ? ZodOptional<ZodType<Exclude<T[key], undefined>>>
      : ZodType<T[key]>;
  }
>;

export type SchemaValuePrimitive = string | number | boolean | undefined;
export type SchemaValue = SchemaValuePrimitive | Record<string, unknown>;
export type SchemaLike<Key extends string = string> = {
  [key in Key]: SchemaValue;
};

export type GeneratedSchema<Schema extends SchemaLike> = keyof Schema extends string
  ? Readonly<{
      table: string;
      tableSingular: string;
      fields: {
        [key in keyof Schema]: string;
      };
      fieldKeys: ReadonlyArray<keyof Schema>;
      guard: Guard<Schema>;
    }>
  : never;
