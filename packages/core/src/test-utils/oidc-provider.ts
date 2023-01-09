import Provider from 'oidc-provider';

const { jest } = import.meta;

export const createMockProvider = (interactionDetails?: jest.Mock): Provider => {
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
  jest.spyOn(provider, 'interactionDetails').mockImplementation(
    // @ts-expect-error for testing
    interactionDetails ?? (async () => ({ params: {}, jti: 'jti', client_id: 'mockApplicationId' }))
  );

  return provider;
};
