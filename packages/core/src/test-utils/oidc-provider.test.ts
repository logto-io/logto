import Provider from 'oidc-provider';
import Sinon from 'sinon';

const { jest } = import.meta;

export abstract class GrantMock {
  static find: (id: string) => Promise<GrantMock | undefined>;

  save: () => Promise<string>;
  addOIDCScope: (scope: string) => void;
  addResourceScope: (resource: string, scope: string) => undefined;

  constructor() {
    this.save = jest.fn(async () => 'finalGrantId');
    this.addOIDCScope = jest.fn();
    this.addResourceScope = jest.fn();
  }
}

export const createMockProvider = (
  interactionDetails?: jest.Mock,
  Grant?: typeof GrantMock
): Provider => {
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

  if (Grant) {
    Sinon.stub(provider, 'Grant').value(Grant);
  }

  return provider;
};
