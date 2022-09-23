export const flattenPromiseResult = async <T>(promise: Promise<T>): Promise<[T?, unknown?]> => {
  try {
    const result = await promise;

    return [result];
  } catch (error: unknown) {
    return [undefined, error];
  }
};
