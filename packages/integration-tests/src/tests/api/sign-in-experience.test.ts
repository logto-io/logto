import { SignInIdentifier } from '@logto/schemas';

import { getSignInExperience, updateSignInExperience } from '#src/api/index.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';

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
        logoUrl: 'https://logto.io/new-logo.png',
        darkLogoUrl: 'https://logto.io/new-dark-logo.png',
      },
      termsOfUseUrl: 'https://logto.io/terms',
      privacyPolicyUrl: 'https://logto.io/privacy',
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

    await expect(updateSignInExperience(newSignInExperience)).rejects.toMatchObject(
      createResponseWithCode(400)
    );
  });
});
