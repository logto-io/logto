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

export const trySafe = async <T>(exec: Promise<T> | (() => Promise<T>)): Promise<T | undefined> => {
  try {
    return await (typeof exec === 'function' ? exec() : exec);
  } catch (error: unknown) {
    console.error('trySafe() caught error', error);
  }
};
