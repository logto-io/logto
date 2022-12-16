export const isEnum = <T extends string>(list: T[], value: unknown): value is T =>
  // @ts-expect-error the easiest way to perform type checking for a string enum
  list.includes(value);
