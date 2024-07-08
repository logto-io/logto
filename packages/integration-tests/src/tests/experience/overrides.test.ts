/**
 * @fileoverview Tests for overriding sign-in experience settings via `override` parameter.
 */

import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
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
    const logoUrl = 'mock://fake-url/logo.png';
    const darkLogoUrl = 'mock://fake-url/dark-logo.png';

    const organization = await organizationApi.create({
      name: 'override-organization',
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
});
