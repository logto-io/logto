import { Provider } from 'oidc-provider';

import koaOidcSessionChecker from '@/middleware/koa-oidc-session-checker';
import { createContextWithRouteParameters } from '@/utils/test-utils';

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
  })),
}));

describe('koaOidcInteraction', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call interactionDetails from the provider', async () => {
    const ctx = createContextWithRouteParameters();
    await expect(koaOidcSessionChecker(new Provider(''))(ctx, next)).resolves.not.toThrow();
    expect(interactionDetails).toHaveBeenCalled();
  });

  it('should call next', async () => {
    const ctx = createContextWithRouteParameters();
    await expect(koaOidcSessionChecker(new Provider(''))(ctx, next)).resolves.not.toThrow();
    expect(next).toHaveBeenCalled();
  });
});
