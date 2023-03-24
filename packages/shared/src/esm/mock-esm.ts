import path from 'node:path';

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
/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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
    // Remove this when we upgrade Node.js to v19+ since we can leverage `import.meta.resolve()` to manually resolve a module
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
