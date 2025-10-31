import { type z } from 'zod';

export const isEnum = <T extends string>(list: T[], value: unknown): value is T =>
  // @ts-expect-error the easiest way to perform type checking for a string enum
  list.includes(value);

export type OmitBooleanValueKeys<T> = Omit<
  T,
  { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T]
>;

export type ToZodEnum<T extends string> = z.ZodEnum<[T, ...T[]]>;

export type RequiredNonNullProperties<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};
