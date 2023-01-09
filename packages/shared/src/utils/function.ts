export const isPromise = (value: unknown): value is Promise<unknown> =>
  value !== null &&
  (typeof value === 'object' || typeof value === 'function') &&
  'then' in value &&
  typeof value.then === 'function';

export type TryThat = {
  <T>(exec: () => T, onError: Error | ((error: unknown) => never)): T;
  <T>(
    exec: Promise<T> | (() => Promise<T>),
    onError: Error | ((error: unknown) => never)
  ): Promise<T>;
};

export const tryThat: TryThat = (exec, onError) => {
  const handleError = (error: unknown) => {
    if (onError instanceof Error) {
      throw onError;
    }

    return onError(error);
  };

  try {
    const unwrapped = typeof exec === 'function' ? exec() : exec;

    return isPromise(unwrapped)
      ? // eslint-disable-next-line promise/prefer-await-to-then
        unwrapped.catch(handleError)
      : unwrapped;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export type TrySafe = {
  <T>(exec: () => T): T | undefined;
  <T>(exec: Promise<T> | (() => Promise<T>)): Promise<T | undefined>;
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
