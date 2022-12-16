import { Provider } from 'oidc-provider';

import koaAuditLogSession from '#src/middleware/koa-audit-log-session.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import { createMockLogContext } from '#src/test-utils/koa-log.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const provider = new Provider('https://logto.test');
const interactionDetails = jest.spyOn(provider, 'interactionDetails');

describe('koaAuditLogSession', () => {
  const sessionId = 'sessionId';
  const applicationId = 'applicationId';
  const log = createMockLogContext();
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
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log,
    };

    await expect(koaAuditLogSession(provider)(ctx, next)).resolves.not.toThrow();
    expect(interactionDetails).toHaveBeenCalled();
  });

  it('should log session id and application id', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log,
    };

    await expect(koaAuditLogSession(provider)(ctx, next)).resolves.not.toThrow();
    expect(log).toHaveBeenCalledWith({ sessionId, applicationId });
  });

  it('should call next', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log,
    };

    await expect(koaAuditLogSession(provider)(ctx, next)).resolves.not.toThrow();
    expect(next).toHaveBeenCalled();
  });

  it('should not throw when interactionDetails throw error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log,
    };

    interactionDetails.mockImplementationOnce(() => {
      throw new Error('message');
    });

    await expect(koaAuditLogSession(provider)(ctx, next)).resolves.not.toThrow();
  });
});
