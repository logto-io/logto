import { safeLazy } from 'react-safe-lazy';

/**
 * An internal module that is used to test the lazy loading failure in the console. Normally, this
 * module should not involve any production code.
 */
export const __Internal__ImportError = safeLazy(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(
    /* @vite-ignore */ `${window.location.origin}/some-non-existing-path`
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return module;
});
