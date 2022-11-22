import { SignInMode } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { getSignInExperienceForApplication } from '#src/lib/sign-in-experience/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaInteractionSieGuard from './koa-interaction-sie-guard.js';

jest.mock('#src/lib/sign-in-experience/index.js', () => ({
  getSignInExperienceForApplication: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {} })),
  })),
}));

describe('getSignInExperienceForApplication', () => {
  const getSignInExperienceForApplicationMock = getSignInExperienceForApplication as jest.Mock;
  const baseCtx = createContextWithRouteParameters();
  const next = jest.fn();

  describe('sign-in mode guard', () => {
    it('should reject register', async () => {
      getSignInExperienceForApplicationMock.mockImplementationOnce(() => ({
        signInMode: SignInMode.SignIn,
      }));

      const ctx = {
        ...baseCtx,
        identifierPayload: Object.freeze({
          event: 'register',
        }),
      };

      await expect(koaInteractionSieGuard(new Provider(''))(ctx, next)).rejects.toThrow();
    });

    it('should reject sign-in', async () => {
      getSignInExperienceForApplicationMock.mockImplementationOnce(() => ({
        signInMode: SignInMode.Register,
      }));

      const ctx = {
        ...baseCtx,
        identifierPayload: Object.freeze({
          event: 'sign-in',
        }),
      };

      await expect(koaInteractionSieGuard(new Provider(''))(ctx, next)).rejects.toThrow();
    });

    it('should allow register', async () => {
      getSignInExperienceForApplicationMock.mockImplementationOnce(() => ({
        signInMode: SignInMode.SignInAndRegister,
      }));

      const ctx = {
        ...baseCtx,
        identifierPayload: Object.freeze({
          event: 'register',
        }),
      };

      await expect(koaInteractionSieGuard(new Provider(''))(ctx, next)).resolves.not.toThrow();
    });
  });

  describe('identifier guard', () => {
    it('username password should allow', async () => {
      getSignInExperienceForApplicationMock.mockImplementationOnce(() => mockSignInExperience);

      const ctx = {
        ...baseCtx,
        identifierPayload: Object.freeze({
          event: 'register',
          identifier: Object.freeze({
            type: 'username_password',
            username: 'username',
            password: 'password',
          }),
        }),
      };

      await expect(koaInteractionSieGuard(new Provider(''))(ctx, next)).resolves.not.toThrow();
    });
  });
});
