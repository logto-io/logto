import { BrandingStyle, SignInExperience } from '@logto/schemas';

import { authedAdminApi } from '@/api';

describe('admin console sign-in experience', () => {
  it('should get sign-in experience successfully', async () => {
    const signInExperience = await authedAdminApi.get('sign-in-exp').json<SignInExperience>();

    expect(signInExperience).toBeTruthy();
  });

  it('should update sign-in experience successfully', async () => {
    const newSignInExperience: Partial<SignInExperience> = {
      color: {
        primaryColor: '#ffffff',
        darkPrimaryColor: '#000000',
        isDarkModeEnabled: true,
      },
      branding: {
        style: BrandingStyle.Logo_Slogan,
        slogan: 'Logto Slogan',
        logoUrl: 'https://logto.io/new-logo.png',
        darkLogoUrl: 'https://logto.io/new-dark-logo.png',
      },
      termsOfUse: {
        enabled: true,
        contentUrl: 'https://logto.io/terms',
      },
    };

    const updatedSignInExperience = await authedAdminApi
      .patch('sign-in-exp', {
        json: newSignInExperience,
      })
      .json<SignInExperience>();

    expect(updatedSignInExperience).toMatchObject(newSignInExperience);
  });
});
