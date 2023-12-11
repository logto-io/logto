import Provider, { type KoaContextWithOIDC } from 'oidc-provider';
import Sinon from 'sinon';

import createMockContext from './jest-koa-mocks/create-mock-context.js';

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
  // eslint-disable-next-line no-console
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

  jest.spyOn(provider, 'interactionResult').mockImplementation(async () => 'redirectTo');

  if (Grant) {
    Sinon.stub(provider, 'Grant').value(Grant);
  }

  return provider;
};

/**
 * Create an empty OIDC context with minimal required properties and a mock provider.
 *
 * @param override - Override the default OIDC context properties.
 */
export const createOidcContext = (override?: Partial<KoaContextWithOIDC['oidc']>) => {
  const issuer = 'https://mock-issuer.com';
  const provider = new Provider(issuer);
  const context: KoaContextWithOIDC = {
    ...createMockContext(),
    oidc: {
      route: '',
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
      },
      params: {},
      entities: {},
      claims: {},
      issuer,
      provider,
      entity: jest.fn(),
      promptPending: jest.fn(),
      requestParamClaims: new Set(),
      requestParamScopes: new Set(),
      prompts: new Set(),
      acr: '',
      amr: [],
      getAccessToken: jest.fn(),
      clientJwtAuthExpectedAudience: jest.fn(),
      ...override,
    },
  };
  return context;
};
