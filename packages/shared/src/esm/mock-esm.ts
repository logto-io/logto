import path from 'path';

const { jest } = import.meta;

type MockParameters<T> = Parameters<(moduleName: string, factory: () => T) => void>;

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

// Depth default is 2 since it'll be called by `mockEsmXyz()` in this module.
// Need to trace one level deeper for the original caller.
const resolvePath = (pathOrModule: string, depth = 2): string => {
  if (pathOrModule === '@logto/shared') {
    return new URL('../../', import.meta.url).pathname;
  }

  if (!pathOrModule.startsWith('.')) {
    return pathOrModule;
  }

  return path.join(path.dirname(callSites()[depth]?.getFileName() ?? ''), pathOrModule);
};

export const mockEsmWithActual: <T>(...args: MockParameters<T>) => Promise<T> = async (
  moduleName,
  factory
) => {
  const resolvedModule = resolvePath(moduleName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actual = await import(resolvedModule);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  jest.unstable_mockModule(resolvedModule, () => ({
    ...actual,
    ...factory(),
  }));

  return import(resolvedModule);
};

export const mockEsm = <T>(...args: MockParameters<T>) => {
  const mocked = args[1]();
  jest.unstable_mockModule(resolvePath(args[0]), () => mocked);

  return mocked;
};

export const mockEsmDefault = <T>(...args: MockParameters<T>) => {
  const mocked = args[1]();

  jest.unstable_mockModule(resolvePath(args[0]), () => ({ default: mocked }));

  return mocked;
};

export const pickDefault = async <T extends Record<'default', unknown>>(
  promise: Promise<T>
): Promise<T['default']> => {
  const awaited = await promise;

  return awaited.default;
};
