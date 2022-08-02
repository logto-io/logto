import { BrandingStyle, SignInMethodState } from '@logto/schemas';

import {
  mockSocialConnectorConfig,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
  twilioSmsConnectorConfig,
  twilioSmsConnectorId,
  sendgridEmailConnectorConfig,
  sendgridEmailConnectorId,
} from '@/__mocks__/connectors-mock';
import { getSignInExperience, updateSignInExperience } from '@/api';
import { updateConnectorConfig, enableConnector, disableConnector } from '@/api/connector';

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

    const updatedSignInExperience = await updateSignInExperience(newSignInExperience);
    expect(updatedSignInExperience).toMatchObject(newSignInExperience);
  });

  it('should be able to setup sign in methods after connectors are enabled', async () => {
    // Setup connectors for tests
    await Promise.all([
      updateConnectorConfig(mockSocialConnectorId, mockSocialConnectorConfig).then(async () =>
        enableConnector(mockSocialConnectorId)
      ),
      updateConnectorConfig(twilioSmsConnectorId, twilioSmsConnectorConfig).then(async () =>
        enableConnector(twilioSmsConnectorId)
      ),
      updateConnectorConfig(sendgridEmailConnectorId, sendgridEmailConnectorConfig).then(async () =>
        enableConnector(sendgridEmailConnectorId)
      ),
    ]);

    // Set up sign-in methods
    const newSignInMethods = {
      username: SignInMethodState.Primary,
      sms: SignInMethodState.Secondary,
      email: SignInMethodState.Secondary,
      social: SignInMethodState.Secondary,
    };

    const updatedSignInExperience = await updateSignInExperience({
      socialSignInConnectorTargets: [mockSocialConnectorTarget],
      signInMethods: newSignInMethods,
    });

    expect(updatedSignInExperience.signInMethods).toMatchObject(newSignInMethods);

    // Reset connectors
    await Promise.all([
      disableConnector(mockSocialConnectorId),
      disableConnector(twilioSmsConnectorId),
      disableConnector(sendgridEmailConnectorId),
    ]);
  });
});
