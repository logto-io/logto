import { Event } from '@logto/schemas';
import type { Context } from 'koa';

import { interactionMocks } from '#src/__mocks__/interactions.js';
import { mockEsmDefault, pickDefault } from '#src/test-utils/mock.js';
import { emptyMiddleware, createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithGuardedIdentifierPayloadContext } from './koa-interaction-body-guard.js';

const { jest } = import.meta;

mockEsmDefault('koa-body', () => emptyMiddleware);

const koaInteractionBodyGuard = await pickDefault(import('./koa-interaction-body-guard.js'));

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
        interactionPayload: { event: Event.SignIn },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it.each([Event.SignIn, Event.ForgotPassword])('%p should parse successfully', async (event) => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event,
          },
        },
        interactionPayload: { event: Event.SignIn },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
      expect(ctx.interactionPayload.event).toEqual(event);
    });

    it('register should parse successfully', async () => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: Event.Register,
            profile: { username: 'username', password: 'password' },
          },
        },
        interactionPayload: { event: Event.SignIn },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
      expect(ctx.interactionPayload.event).toEqual(Event.Register);
    });
  });

  describe('identifier', () => {
    it('invalid identifier should throw', async () => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: Event.SignIn,
            identifier: {
              username: 'username',
              passcode: 'passcode',
            },
          },
        },
        interactionPayload: { event: Event.SignIn },
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it.each(interactionMocks)('interaction methods should parse successfully', async (input) => {
      const ctx: WithGuardedIdentifierPayloadContext<Context> = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: Event.SignIn,
            identifier: input,
          },
        },
        interactionPayload: { event: Event.SignIn },
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
            event: Event.SignIn,
            profile: {
              email: 'username',
            },
          },
        },
        interactionPayload: { event: Event.SignIn },
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
            event: Event.SignIn,
            profile,
          },
        },
        interactionPayload: { event: Event.SignIn },
      };
      await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
      expect(ctx.interactionPayload.profile).toEqual(profile);
    });
  });
});
