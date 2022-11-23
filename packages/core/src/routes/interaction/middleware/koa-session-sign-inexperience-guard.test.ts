import { SignInMode } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { getSignInExperienceForApplication } from '#src/lib/sign-in-experience/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaSessionSignInExperienceGuard from './koa-session-sign-in-experience-guard.js';

jest.mock('#src/lib/sign-in-experience/index.js', () => ({
  getSignInExperienceForApplication: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {} })),
  })),
}));

describe('koaSessionSignInExperienceGuard', () => {
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
        interactionPayload: Object.freeze({
          event: 'register',
        }),
        signInExperience: mockSignInExperience,
      };

      await expect(koaSessionSignInExperienceGuard(new Provider(''))(ctx, next)).rejects.toThrow();
    });

    it('should reject sign-in', async () => {
      getSignInExperienceForApplicationMock.mockImplementationOnce(() => ({
        signInMode: SignInMode.Register,
      }));

      const ctx = {
        ...baseCtx,
        interactionPayload: Object.freeze({
          event: 'sign-in',
        }),
        signInExperience: mockSignInExperience,
      };

      await expect(koaSessionSignInExperienceGuard(new Provider(''))(ctx, next)).rejects.toThrow();
    });

    it('should allow register', async () => {
      getSignInExperienceForApplicationMock.mockImplementationOnce(() => ({
        signInMode: SignInMode.SignInAndRegister,
      }));

      const ctx = {
        ...baseCtx,
        interactionPayload: Object.freeze({
          event: 'register',
        }),
        signInExperience: mockSignInExperience,
      };

      await expect(
        koaSessionSignInExperienceGuard(new Provider(''))(ctx, next)
      ).resolves.not.toThrow();
      expect(ctx.signInExperience).toEqual({
        signInMode: SignInMode.SignInAndRegister,
      });
    });
  });
});
