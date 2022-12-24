export const tryThat = async <T, E extends Error>(
  exec: Promise<T> | (() => Promise<T>),
  onError: E | ((error: unknown) => never)
): Promise<T> => {
  try {
    return await (typeof exec === 'function' ? exec() : exec);
  } catch (error: unknown) {
    if (onError instanceof Error) {
      // https://github.com/typescript-eslint/typescript-eslint/issues/3814
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw onError;
    }

    return onError(error);
  }
};

export const isPromise = (value: unknown): value is Promise<unknown> =>
  value !== null &&
  (typeof value === 'object' || typeof value === 'function') &&
  'then' in value &&
  typeof value.then === 'function';

export type TrySafe = {
  <T>(exec: Promise<T> | (() => Promise<T>)): Promise<T | undefined>;
  <T>(exec: () => T): T | undefined;
};

export const trySafe: TrySafe = (exec) => {
  try {
    const unwrapped = typeof exec === 'function' ? exec() : exec;

    return isPromise(unwrapped)
      ? // eslint-disable-next-line promise/prefer-await-to-then
        unwrapped.catch((error: unknown) => {
          console.error('trySafe() caught error', error);
        })
      : unwrapped;
  } catch (error: unknown) {
    console.error('trySafe() caught error', error);
  }
};
