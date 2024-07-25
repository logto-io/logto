import safeLazy from '@/utils/lazy';

export const __Internal__ImportError = safeLazy(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = await import(
    /* @vite-ignore */ `${window.location.origin}/some-non-existing-path`
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return module;
});
