import { Event } from '@logto/schemas';
import { mockEsm, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

mockEsm('#src/libraries/sign-in-experience/index.js', () => ({
  getSignInExperienceForApplication: jest.fn().mockResolvedValue(mockSignInExperience),
}));

const mockUtils = {
  signInModeValidation: jest.fn(),
  identifierValidation: jest.fn(),
  profileValidation: jest.fn(),
};

mockEsm('../utils/sign-in-experience-validation.js', () => mockUtils);

const koaSessionSignInExperienceGuard = await pickDefault(
  import('./koa-session-sign-in-experience-guard.js')
);

describe('koaSessionSignInExperienceGuard', () => {
  const baseCtx = createContextWithRouteParameters();
  const next = jest.fn();

  it('should call validation method properly', async () => {
    const ctx = {
      ...baseCtx,
      interactionPayload: Object.freeze({
        event: Event.SignIn,
        identifier: { username: 'username', password: 'password' },
        profile: { email: 'email' },
      }),
      signInExperience: mockSignInExperience,
    };
    const provider = createMockProvider();

    await koaSessionSignInExperienceGuard(provider)(ctx, next);

    expect(mockUtils.signInModeValidation).toBeCalledWith(Event.SignIn, mockSignInExperience);
    expect(mockUtils.identifierValidation).toBeCalledWith(
      { username: 'username', password: 'password' },
      mockSignInExperience
    );
    expect(mockUtils.profileValidation).toBeCalledWith({ email: 'email' }, mockSignInExperience);
  });
});
