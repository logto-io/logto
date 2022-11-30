import { Event } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { Identifier, InteractionContext } from '../types/index.js';
import profileVerification from './profile-verification.js';

jest.mock('#src/queries/user.js', () => ({
  findUserById: jest.fn().mockResolvedValue({ id: 'foo' }),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
}));

jest.mock('#src/connectors/index.js', () => ({
  getLogtoConnectorById: jest.fn().mockResolvedValue({
    metadata: { target: 'logto' },
  }),
}));

describe('profile protected identifier verification', () => {
  const baseCtx = createContextWithRouteParameters();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('email, phone and social identifier must be verified', () => {
    it('email without a verified identifier should throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            email: 'email',
          },
        },
      };

      const identifiers: Identifier[] = [{ key: 'accountId', value: 'foo' }];

      await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('email with unmatched identifier should throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            email: 'email',
          },
        },
      };

      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'emailVerified', value: 'phone' },
      ];
      await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('email with proper identifier should not throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            email: 'email',
          },
        },
      };

      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'emailVerified', value: 'email' },
      ];
      await expect(profileVerification(ctx, identifiers)).resolves.not.toThrow();
    });

    it('phone without a verified identifier should throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            phone: 'phone',
          },
        },
      };

      const identifiers: Identifier[] = [{ key: 'accountId', value: 'foo' }];

      await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('phone with unmatched identifier should throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            phone: 'phone',
          },
        },
      };

      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'phoneVerified', value: 'email' },
      ];
      await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );
    });

    it('phone with proper identifier should not throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            phone: 'phone',
          },
        },
      };

      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'phoneVerified', value: 'phone' },
      ];
      await expect(profileVerification(ctx, identifiers)).resolves.not.toThrow();
    });

    it('connectorId without a verified identifier should throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            connectorId: 'connectorId',
          },
        },
      };

      const identifiers: Identifier[] = [{ key: 'accountId', value: 'foo' }];

      await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
        new RequestError({ code: 'session.connector_session_not_found', status: 404 })
      );
    });

    it('connectorId with unmatched identifier should throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            connectorId: 'logto',
          },
        },
      };

      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'social', connectorId: 'connectorId', value: { id: 'foo' } },
      ];
      await expect(profileVerification(ctx, identifiers)).rejects.toMatchError(
        new RequestError({ code: 'session.connector_session_not_found', status: 404 })
      );
    });

    it('connectorId with proper identifier should not throw', async () => {
      const ctx: InteractionContext = {
        ...baseCtx,
        interactionPayload: {
          event: Event.SignIn,
          profile: {
            connectorId: 'logto',
          },
        },
      };

      const identifiers: Identifier[] = [
        { key: 'accountId', value: 'foo' },
        { key: 'social', connectorId: 'logto', value: { id: 'foo' } },
      ];

      await expect(profileVerification(ctx, identifiers)).resolves.not.toThrow();
    });
  });
});
