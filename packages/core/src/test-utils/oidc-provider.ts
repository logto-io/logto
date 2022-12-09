import { Provider } from 'oidc-provider';

const { jest } = import.meta;

export const createMockProvider = (): Provider => {
  const originalWarn = console.warn;
  const warn = jest.spyOn(console, 'warn').mockImplementation((...args) => {
    // Disable while creating. Too many warnings.
    if (typeof args[0] === 'string' && args[0].includes('oidc-provider')) {
      return;
    }

    originalWarn(...args);
  });
  const provider = new Provider('https://logto.test');

  warn.mockRestore();
  jest
    .spyOn(provider, 'interactionDetails')
    // @ts-expect-error for testing
    .mockResolvedValue({ params: {}, jti: 'jti' });

  return provider;
};
