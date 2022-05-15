import { Provider } from 'oidc-provider';

import { WithLogContext } from '@/middleware/koa-log';
import koaLogSession from '@/middleware/koa-log-session';
import { createContextWithRouteParameters } from '@/utils/test-utils';

const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
  })),
}));

describe('koaLogSession', () => {
  const sessionId = 'sessionId';
  const applicationId = 'applicationId';
  const addLogContext = jest.fn();
  const log = jest.fn();
  const next = jest.fn();

  interactionDetails.mockResolvedValue({
    jti: sessionId,
    params: {
      client_id: applicationId,
    },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get session info from the provider', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    await expect(koaLogSession(new Provider(''))(ctx, next)).resolves.not.toThrow();
    expect(interactionDetails).toHaveBeenCalled();
  });

  it('should log session id and application id', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    await expect(koaLogSession(new Provider(''))(ctx, next)).resolves.not.toThrow();
    expect(addLogContext).toHaveBeenCalledWith({ sessionId, applicationId });
  });

  it('should call next', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    await expect(koaLogSession(new Provider(''))(ctx, next)).resolves.not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  it('should not throw when interactionDetails throw error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    interactionDetails.mockImplementationOnce(() => {
      throw new Error('message');
    });

    await expect(koaLogSession(new Provider(''))(ctx, next)).resolves.not.toThrow();
  });
});
