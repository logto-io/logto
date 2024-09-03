import { MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { getSignInExperience, updateSignInExperience } from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';

describe('admin console sign-in experience', () => {
  it('should get sign-in experience successfully', async () => {
    const signInExperience = await getSignInExperience();

    expect(signInExperience).toBeTruthy();
  });

  it('should update sign-in experience successfully', async () => {
    const newSignInExperience = {
      color: {
        primaryColor: '#ffffff',
        darkPrimaryColor: '#000000',
        isDarkModeEnabled: true,
      },
      branding: {
        logoUrl: 'mock://fake-url/logo.png',
        darkLogoUrl: 'mock://fake-url/dark-logo.png',
      },
      termsOfUseUrl: 'mock://fake-url/terms',
      privacyPolicyUrl: 'mock://fake-url/privacy',
      mfa: {
        policy: MfaPolicy.UserControlled,
        factors: [],
      },
      singleSignOnEnabled: true,
    };

    const updatedSignInExperience = await updateSignInExperience(newSignInExperience);
    expect(updatedSignInExperience).toMatchObject(newSignInExperience);
  });

  it('throw 400 when fail to validate SIE', async () => {
    const newSignInExperience = {
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: false,
        verify: false,
      },
    };

    await expectRejects(updateSignInExperience(newSignInExperience), {
      code: 'sign_in_experiences.username_requires_password',
      status: 400,
    });
  });
});
