import type { Context } from 'koa';

import { interactionMocks } from '#src/__mocks__/interactions.js';
import { emptyMiddleware, createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithGuardedIdentifierPayloadContext } from './koa-interaction-body-guard.js';
import koaInteractionBodyGuard from './koa-interaction-body-guard.js';

jest.mock('koa-body', () => emptyMiddleware);

// User this to bypass the context type assertion
const mockIdentifierPayload = Object.freeze({
  type: 'username_password',
  username: 'username',
  password: 'password',
});

describe('koaInteractionBodyGuard', () => {
  const baseCtx = createContextWithRouteParameters();
  const next = jest.fn();

  describe('event', () => {
    it('invalid event should throw', async () => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'test',
          },
        },
        interactionPayload: { event: 'sign-in' },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it.each(['sign-in', 'register', 'forgot-password'])(
      '%p should parse successfully',
      async (event) => {
        const ctx: WithGuardedIdentifierPayloadContext<Context> = {
          ...baseCtx,
          request: {
            ...baseCtx.request,
            body: {
              event,
            },
          },
          interactionPayload: { event: 'sign-in' },
        };

        await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
        expect(ctx.interactionPayload.event).toEqual(event);
      }
    );
  });

  describe('identifier', () => {
    it('invalid identifier should throw', async () => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'sign-in',
            identifier: {
              username: 'username',
              passcode: 'passcode',
            },
          },
        },
        interactionPayload: { event: 'sign-in' },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it.each(interactionMocks)('interaction methods should parse successfully', async (input) => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'sign-in',
            identifier: input,
          },
        },
        interactionPayload: { event: 'sign-in' },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
      expect(ctx.interactionPayload.identifier).toEqual(input);
    });
  });

  describe('profile', () => {
    it('invalid profile format should throw', async () => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'sign-in',
            profile: {
              email: 'username',
            },
          },
        },
        interactionPayload: { event: 'sign-in' },
      };
      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it('profile should resolve properly', async () => {
      const profile = {
        email: 'foo@logto.io',
        phone: '123123',
        username: 'username',
        password: '123456',
        connectorId: 'connectorId',
      };

      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'sign-in',
            profile,
          },
        },
        interactionPayload: { event: 'sign-in' },
      };
      await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
      expect(ctx.interactionPayload.profile).toEqual(profile);
    });
  });
});
