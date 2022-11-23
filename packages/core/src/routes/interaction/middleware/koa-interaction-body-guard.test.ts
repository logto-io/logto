import { interactionMocks } from '#src/__mocks__/interactions.js';
import { emptyMiddleware, createContextWithRouteParameters } from '#src/utils/test-utils.js';

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
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'test',
          },
        },
        identifierPayload: Object.freeze({
          event: 'sign-in',
        }),
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it.each(['sign-in', 'register', 'forgot-password'])(
      '%p should parse successfully',
      async (event) => {
        const ctx = {
          ...baseCtx,
          request: {
            ...baseCtx.request,
            body: {
              event,
            },
          },
          identifierPayload: Object.freeze({
            event: 'sign-in',
          }),
        };

        await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
        expect(ctx.identifierPayload.event).toEqual(event);
      }
    );
  });

  describe('identifier', () => {
    it('invalid identifier should throw', async () => {
      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'sign-in',
            identifier: {
              username: 'username',
            },
          },
        },
        identifierPayload: Object.freeze({
          event: 'sign-in',
        }),
      };

      await expect(koaInteractionBodyGuard()(ctx, next)).rejects.toThrow();
    });

    it.each(interactionMocks)(
      'interaction methods should parse successfully',
      async ({ input, output }) => {
        const ctx = {
          ...baseCtx,
          request: {
            ...baseCtx.request,
            body: {
              event: 'sign-in',
              identifier: input,
            },
          },
          identifierPayload: Object.freeze({
            event: 'sign-in',
            identifier: mockIdentifierPayload,
          }),
        };

        await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
        expect(ctx.identifierPayload.identifier).toEqual(output);
      }
    );
  });

  describe('profile', () => {
    it('invalid profile format should throw', async () => {
      const ctx = {
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
        identifierPayload: Object.freeze({
          event: 'sign-in',
          profile: {},
        }),
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

      const ctx = {
        ...baseCtx,
        request: {
          ...baseCtx.request,
          body: {
            event: 'sign-in',
            profile,
          },
        },
        identifierPayload: Object.freeze({
          event: 'sign-in',
          profile: {},
        }),
      };
      await expect(koaInteractionBodyGuard()(ctx, next)).resolves.not.toThrow();
      expect(ctx.identifierPayload.profile).toEqual(profile);
    });
  });
});
