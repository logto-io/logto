import path from 'path';

export type WithEsmMock = {
  // Copied from `@jest/globals`
  /**
   * Mocks a module with the provided module factory when it is being imported.
   */
  unstable_mockModule<T = unknown>(
    moduleName: string,
    moduleFactory: () => T | Promise<T>,
    options?: {
      virtual?: boolean;
    }
    // This should be a global jest type, but hard to align with the global type from the caller.
    // We met several issues while using generic / global override.
    // Move forward with `unknown` since it doesn't matter here.
  ): unknown;
};

export type MockParameters<T> = Parameters<(moduleName: string, factory: () => T) => void>;

export const pickDefault = async <T extends Record<'default', unknown>>(
  promise: Promise<T>
): Promise<T['default']> => {
  const awaited = await promise;

  return awaited.default;
};

// See https://github.com/sindresorhus/callsites
/* eslint-disable @silverhand/fp/no-mutation */
const callSites = (): NodeJS.CallSite[] => {
  const _prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const stack = new Error().stack?.slice(1); // eslint-disable-line unicorn/error-message
  Error.prepareStackTrace = _prepareStackTrace;

  // @ts-expect-error ignore the error since it has been replaced with the original stack array
  return stack ?? [];
};
/* eslint-enable @silverhand/fp/no-mutation */

export const createMockUtils = (jestInstance: WithEsmMock) => {
  const mockEsm = <T>(...[moduleName, factory]: MockParameters<T>) => {
    const mocked = factory();

    jestInstance.unstable_mockModule(moduleName, () => mocked);

    return mocked;
  };

  const mockEsmDefault = <T>(...[moduleName, factory]: MockParameters<T>) => {
    const mocked = factory();

    jestInstance.unstable_mockModule(moduleName, () => ({ default: mocked }));

    return mocked;
  };

  const mockEsmWithActual = async <T>(...[moduleName, factory]: MockParameters<T>): Promise<T> => {
    const resolved = moduleName.startsWith('.')
      ? path.join(path.dirname(callSites()[1]?.getFileName() ?? ''), moduleName)
      : moduleName;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = await import(resolved);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    mockEsm(resolved, () => ({
      ...actual,
      ...factory(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return import(resolved);
  };

  return { mockEsm, mockEsmDefault, mockEsmWithActual };
};
