import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { mockSocialConnectorTarget } from '#src/__mocks__/connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('direct sign-in', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setSocialConnector();
    await updateSignInExperience({
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
      socialSignInConnectorTargets: ['mock-social'],
    });
  });

  it('should be landed to the social identity provider directly', async () => {
    const experience = new ExpectExperience(await browser.newPage());
    const url = new URL(demoAppUrl);

    url.searchParams.set('direct_sign_in', `social:${mockSocialConnectorTarget}`);
    await experience.page.goto(url.href);
    await experience.toProcessSocialSignIn({ socialUserId: 'foo', clickButton: false });
    experience.toMatchUrl(demoAppUrl);
    await experience.toClick('div[role=button]', /sign out/i);
    await experience.page.close();
  });

  it('should fall back to the sign-in page if the direct sign-in target is invalid', async () => {
    const experience = new ExpectExperience(await browser.newPage());
    const url = new URL(demoAppUrl);

    url.searchParams.set('direct_sign_in', 'social:invalid-target');
    await experience.navigateTo(url.href);
    experience.toBeAt('sign-in');
    await experience.page.close();
  });

  it('should fall back to the register page if the direct sign-in target is invalid and `first_screen` is `register`', async () => {
    const experience = new ExpectExperience(await browser.newPage());
    const url = new URL(demoAppUrl);

    url.searchParams.set('direct_sign_in', 'social:invalid-target');
    url.searchParams.set('first_screen', 'register');
    await experience.navigateTo(url.href);
    experience.toBeAt('register');
    await experience.page.close();
  });
});
