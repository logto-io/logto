/**
 * @fileoverview Tests for overriding sign-in experience settings via `override` parameter.
 */

import { ConnectorType } from '@logto/connector-kit';
import { ApplicationType, SignInIdentifier } from '@logto/schemas';

import { setApplicationSignInExperience } from '#src/api/application-sign-in-experience.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppRedirectUri, demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';

describe('override', () => {
  const organizationApi = new OrganizationApiTest();

  afterEach(async () => {
    await organizationApi.cleanUp();
  });

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await updateSignInExperience({
      termsOfUseUrl: null,
      privacyPolicyUrl: null,
      color: { primaryColor: '#000', darkPrimaryColor: '#fff', isDarkModeEnabled: true },
      signUp: { identifiers: [], password: true, verify: false },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });
  });

  it('should show the overridden organization logos', async () => {
    const logoUrl = 'mock://fake-url-for-organization/logo.png';
    const darkLogoUrl = 'mock://fake-url-for-organization/dark-logo.png';

    const organization = await organizationApi.create({
      name: 'Sign-in experience override',
      branding: {
        logoUrl,
        darkLogoUrl,
      },
    });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await experience.navigateTo(demoAppUrl.href + `?organization_id=${organization.id}`);
    await experience.toMatchElement(`img[src="${logoUrl}"]`);

    await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await experience.navigateTo(demoAppUrl.href + `?organization_id=${organization.id}`);
    await experience.toMatchElement(`img[src="${darkLogoUrl}"]`);
  });

  it('should show app-level logo and color', async () => {
    const logoUrl = 'mock://fake-url-for-app/logo.png';
    const darkLogoUrl = 'mock://fake-url-for-app/dark-logo.png';
    const primaryColor = '#f00';
    const darkPrimaryColor = '#0f0';

    const application = await createApplication(
      'Sign-in experience override',
      ApplicationType.SPA,
      {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
      }
    );

    await setApplicationSignInExperience(application.id, {
      color: {
        primaryColor,
        darkPrimaryColor,
      },
      branding: {
        logoUrl,
        darkLogoUrl,
      },
    });

    const experience = new ExpectExperience(await browser.newPage());
    const expectMatchBranding = async (theme: string, logoUrl: string, primaryColor: string) => {
      await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
      await experience.navigateTo(demoAppUrl.href + `?app_id=${application.id}`);
      await experience.toMatchElement(`img[src="${logoUrl}"]`);
      const button1 = await experience.toMatchElement('button[name="submit"]');
      expect(
        await button1.evaluate((element) => window.getComputedStyle(element).backgroundColor)
      ).toBe(primaryColor);
    };

    await expectMatchBranding('light', logoUrl, 'rgb(255, 0, 0)');
    await expectMatchBranding('dark', darkLogoUrl, 'rgb(0, 255, 0)');

    await deleteApplication(application.id);
  });

  it('should combine app-level and organization-level branding', async () => {
    const organizationLogoUrl = 'mock://fake-url-for-organization/logo.png';
    const organizationDarkLogoUrl = 'mock://fake-url-for-organization/dark-logo.png';

    const appLogoUrl = 'mock://fake-url-for-app/logo.png';
    const appDarkLogoUrl = 'mock://fake-url-for-app/dark-logo.png';
    const appPrimaryColor = '#00f';
    const appDarkPrimaryColor = '#f0f';

    const organization = await organizationApi.create({
      name: 'Sign-in experience override',
      branding: {
        logoUrl: organizationLogoUrl,
        darkLogoUrl: organizationDarkLogoUrl,
      },
    });

    const application = await createApplication(
      'Sign-in experience override',
      ApplicationType.SPA,
      {
        oidcClientMetadata: {
          redirectUris: [demoAppRedirectUri],
          postLogoutRedirectUris: [demoAppRedirectUri],
        },
      }
    );

    await setApplicationSignInExperience(application.id, {
      color: {
        primaryColor: appPrimaryColor,
        darkPrimaryColor: appDarkPrimaryColor,
      },
      branding: {
        logoUrl: appLogoUrl,
        darkLogoUrl: appDarkLogoUrl,
      },
    });

    const experience = new ExpectExperience(await browser.newPage());
    const expectMatchBranding = async (theme: string, logoUrl: string, primaryColor: string) => {
      await experience.page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
      await experience.navigateTo(
        demoAppUrl.href + `?app_id=${application.id}&organization_id=${organization.id}`
      );
      await experience.toMatchElement(`img[src="${logoUrl}"]`);
      const button1 = await experience.toMatchElement('button[name="submit"]');
      expect(
        await button1.evaluate((element) => window.getComputedStyle(element).backgroundColor)
      ).toBe(primaryColor);
    };

    await expectMatchBranding('light', organizationLogoUrl, 'rgb(0, 0, 255)');
    await expectMatchBranding('dark', organizationDarkLogoUrl, 'rgb(255, 0, 255)');
  });
});
