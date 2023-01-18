export const isKeyInObject = <Key extends string>(
  object: unknown,
  key: Key
): object is object & Record<Key, unknown> =>
  object !== null && typeof object === 'object' && key in object;
