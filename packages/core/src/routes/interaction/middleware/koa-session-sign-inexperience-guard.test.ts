import { Provider } from 'oidc-provider';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import {
  signInModeValidation,
  identifierValidation,
  profileValidation,
} from '../utils/sign-in-experience-validation.js';
import koaSessionSignInExperienceGuard from './koa-session-sign-in-experience-guard.js';

jest.mock('#src/lib/sign-in-experience/index.js', () => ({
  getSignInExperienceForApplication: jest.fn().mockResolvedValue(mockSignInExperience),
}));

jest.mock('../utils/sign-in-experience-validation.js', () => ({
  signInModeValidation: jest.fn(),
  identifierValidation: jest.fn(),
  profileValidation: jest.fn(),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(async () => ({ params: {} })),
  })),
}));

describe('koaSessionSignInExperienceGuard', () => {
  const baseCtx = createContextWithRouteParameters();
  const next = jest.fn();

  it('should call validation method properly', async () => {
    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: 'sign-in',
        identifier: { username: 'username', password: 'password' },
        profile: { email: 'email' },
      }),
    };

    await koaSessionSignInExperienceGuard(new Provider(''))(ctx, next);

    expect(signInModeValidation).toBeCalledWith('sign-in', mockSignInExperience);
    expect(identifierValidation).toBeCalledWith(
      { username: 'username', password: 'password' },
      mockSignInExperience
    );
    expect(profileValidation).toBeCalledWith({ email: 'email' }, mockSignInExperience);
  });
});
