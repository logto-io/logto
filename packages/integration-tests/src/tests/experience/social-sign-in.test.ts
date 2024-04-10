import crypto from 'node:crypto';

import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier, SignInMode, SsoProviderName } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createSsoConnector } from '#src/api/sso-connector.js';
import { demoAppUrl, logtoUrl } from '#src/constants.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { dcls, dmodal, generateEmail } from '#src/utils.js';

const randomString = () => crypto.randomBytes(8).toString('hex');

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('social sign-in (with email identifier)', () => {
  const context = new (class Context {
    ssoConnectorId?: string;
  })();
  const ssoOidcIssuer = `${logtoUrl}/oidc`;
  // eslint-disable-next-line @silverhand/fp/no-let
  let experience: ExpectExperience;
  const socialUserId = 'foo_' + randomString();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSocialConnector();
    const ssoConnector = await createSsoConnector({
      providerName: SsoProviderName.OIDC,
      connectorName: 'test-oidc-' + randomString(),
      domains: [`foo${randomString()}.com`],
      config: {
        clientId: 'foo',
        clientSecret: 'bar',
        issuer: ssoOidcIssuer,
      },
    });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    context.ssoConnectorId = ssoConnector.id;
    await updateSignInExperience({
      termsOfUseUrl: 'https://example.com/terms',
      privacyPolicyUrl: 'https://example.com/privacy',
      signUp: { identifiers: [SignInIdentifier.Email], password: true, verify: true },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      signInMode: SignInMode.SignIn,
      singleSignOnEnabled: true,
      socialSignInConnectorTargets: ['mock-social'],
    });
  });

  it('should be able to start the social sign-in flow', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toProcessSocialSignIn({
      socialUserId,
    });

    // Registration disabled, should be redirected back to the sign-in page
    await experience.waitForToast('not been registered yet');
    experience.toBeAt('sign-in');
  });

  it('should be able to cancel (disagree) the terms of use', async () => {
    await updateSignInExperience({ signInMode: SignInMode.SignInAndRegister });
    await experience.toProcessSocialSignIn({
      socialUserId,
    });
    // Redirected back to the social callback page
    experience.toMatchUrl(new RegExp(appendPath(new URL(logtoUrl), 'callback/social/.*').href));

    // Should have popped up the terms of use and privacy policy dialog
    await experience.toMatchElement([dmodal(), dcls('content')].join(' '), {
      text: /terms of use/i,
    });
    await experience.toClickButton(/cancel/i);
    experience.toBeAt('sign-in');
  });

  it('should be able to start the social sign-in flow again if state mismatch', async () => {
    await experience.toProcessSocialSignIn({
      socialUserId,
      state: '', // Overriding the state to cause a mismatch
    });
    await experience.waitForToast(/invalid/);
    experience.toBeAt('sign-in');
  });

  it('should be able to start the social sign-in flow again', async () => {
    await experience.toProcessSocialSignIn({
      socialUserId,
    });

    // Redirected back to the social callback page
    experience.toMatchUrl(new RegExp(appendPath(new URL(logtoUrl), 'callback/social/.*').href));

    // Should have popped up the terms of use and privacy policy dialog
    await experience.toMatchElement([dmodal(), dcls('content')].join(' '), {
      text: /terms of use/i,
    });
    await experience.toClickButton(/agree/i);
  });

  it('should be able to verify the required email address', async () => {
    await experience.toFillInput('identifier', generateEmail(), { submit: true });
    await experience.toCompleteVerification('continue', 'Email');

    await experience.verifyThenEnd();
  });

  it('should directly sign in for existing users without pop-up terms of use', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toProcessSocialSignIn({
      socialUserId,
    });
    await experience.verifyThenEnd();
  });

  it('should directly sign in for new users when terms of use has not been set', async () => {
    await updateSignInExperience({
      termsOfUseUrl: '',
      privacyPolicyUrl: '',
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toProcessSocialSignIn({
      socialUserId: 'bar_' + randomString(),
    });
    await experience.toFillInput('identifier', generateEmail(), { submit: true });
    await experience.toCompleteVerification('continue', 'Email');
    await experience.verifyThenEnd();
  });
});
