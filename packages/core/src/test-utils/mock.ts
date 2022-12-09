const { jest } = import.meta;

export const mockEsmWithActual: <T>(
  ...args: Parameters<typeof jest.unstable_mockModule<T>>
) => Promise<T> = async (moduleName, factory) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = await import(moduleName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  jest.unstable_mockModule(moduleName, () => ({
    ...actual,
    ...factory(),
  }));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return import(moduleName);
};

export const mockEsm = <T>(...args: Parameters<typeof jest.unstable_mockModule<T>>) => {
  jest.unstable_mockModule(...args);
};

export const mockEsmDefault = <T>(...args: Parameters<typeof jest.unstable_mockModule<T>>) => {
  jest.unstable_mockModule(args[0], () => ({ default: args[1]() }));
};

export const pickDefault = async <T extends Record<'default', unknown>>(
  promise: Promise<T>
): Promise<T['default']> => {
  const awaited = await promise;

  return awaited.default;
};
