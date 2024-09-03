export type KebabCase<T extends string> = T extends `${infer L}${infer M}${infer R}`
  ? L extends Lowercase<L>
    ? M extends Lowercase<M>
      ? `${L}${KebabCase<`${M}${R}`>}`
      : `${L}-${KebabCase<`${M}${R}`>}`
    : M extends Lowercase<M>
    ? `${Lowercase<L>}${KebabCase<`${M}${R}`>}`
    : R extends Uncapitalize<R>
    ? `${Lowercase<L>}-${Lowercase<M>}${KebabCase<R>}`
    : `${Lowercase<L>}${KebabCase<`${M}${R}`>}`
  : T;

export const kebabCase = <T extends string>(value: T): KebabCase<T> => {
  // eslint-disable-next-line no-restricted-syntax -- `as` assertion is needed to make TS happy
  return value
    .replaceAll(/([^A-Z])([A-Z])/g, '$1-$2')
    .replaceAll(/([A-Z])([A-Z][^A-Z])/g, '$1-$2')
    .toLowerCase() as KebabCase<T>;
};
