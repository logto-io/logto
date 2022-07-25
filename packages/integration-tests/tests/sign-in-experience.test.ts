import { BrandingStyle, SignInExperience, SignInMethods, SignInMethodState } from '@logto/schemas';

import { authedAdminApi } from '@/api';
import { updateConnectorConfig, enableConnector } from '@/connector-api';
import {
  facebookConnectorId,
  facebookConnectorConfig,
  twilioSmsConnectorConfig,
  twilioSmsConnectorId,
  sendgridEmailConnectorConfig,
  sendgridEmailConnectorId,
  facebookConnectorTarget,
} from '@/connectors-mock';

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

  it('should be able to setup sign in methods after connectors are enabled', async () => {
    // Setup a social connector
    await updateConnectorConfig(facebookConnectorId, facebookConnectorConfig);
    await enableConnector(facebookConnectorId);

    // Setup a SMS connector
    await updateConnectorConfig(twilioSmsConnectorId, twilioSmsConnectorConfig);
    await enableConnector(twilioSmsConnectorId);

    // Setup an email connector
    await updateConnectorConfig(sendgridEmailConnectorId, sendgridEmailConnectorConfig);
    await enableConnector(sendgridEmailConnectorId);

    // Set up sign-in methods
    const newSignInMethods: Partial<SignInMethods> = {
      username: SignInMethodState.Primary,
      sms: SignInMethodState.Secondary,
      email: SignInMethodState.Secondary,
      social: SignInMethodState.Secondary,
    };

    const updatedSignInExperience = await authedAdminApi
      .patch('sign-in-exp', {
        json: {
          socialSignInConnectorTargets: [facebookConnectorTarget],
          signInMethods: newSignInMethods,
        },
      })
      .json<SignInExperience>();

    expect(updatedSignInExperience.signInMethods).toMatchObject(newSignInMethods);
  });
});
