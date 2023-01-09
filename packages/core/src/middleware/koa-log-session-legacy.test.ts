import Provider from 'oidc-provider';

import type { WithLogContextLegacy } from '#src/middleware/koa-audit-log-legacy.js';
import koaLogSessionLegacy from '#src/middleware/koa-log-session-legacy.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const provider = new Provider('https://logto.test');
const interactionDetails = jest.spyOn(provider, 'interactionDetails');

describe('koaLogSessionLegacy', () => {
  const sessionId = 'sessionId';
  const applicationId = 'applicationId';
  const addLogContext = jest.fn();
  const log = jest.fn();
  const next = jest.fn();

  // @ts-expect-error for testing
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
    const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    await expect(koaLogSessionLegacy(provider)(ctx, next)).resolves.not.toThrow();
    expect(interactionDetails).toHaveBeenCalled();
  });

  it('should log session id and application id', async () => {
    const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    await expect(koaLogSessionLegacy(provider)(ctx, next)).resolves.not.toThrow();
    expect(addLogContext).toHaveBeenCalledWith({ sessionId, applicationId });
  });

  it('should call next', async () => {
    const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    await expect(koaLogSessionLegacy(provider)(ctx, next)).resolves.not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  it('should not throw when interactionDetails throw error', async () => {
    const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
    };

    interactionDetails.mockImplementationOnce(() => {
      throw new Error('message');
    });

    await expect(koaLogSessionLegacy(provider)(ctx, next)).resolves.not.toThrow();
  });
});
