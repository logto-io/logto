import { ConnectorType } from '@logto/connector-kit';
import { AgreeToTermsPolicy, SignInIdentifier, SsoProviderName } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';

import { mockSocialConnectorTarget } from '#src/__mocks__/connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createSsoConnector } from '#src/api/sso-connector.js';
import { demoAppUrl, logtoUrl, mockSocialAuthPageUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { dcls, devFeatureTest, dmodal, randomString } from '#src/utils.js';

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('direct sign-in', () => {
  const context = new (class Context {
    ssoConnectorId?: string;
  })();
  const ssoOidcIssuer = `${logtoUrl}/oidc`;

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
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
      agreeToTermsPolicy: AgreeToTermsPolicy.ManualRegistrationOnly,
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
      singleSignOnEnabled: true,
      socialSignInConnectorTargets: ['mock-social'],
    });
  });

  it('should be landed to the social identity provider directly', async () => {
    const socialUserId = 'foo_' + randomString();
    const experience = new ExpectExperience(await browser.newPage());
    const url = new URL(demoAppUrl);

    url.searchParams.set('direct_sign_in', `social:${mockSocialConnectorTarget}`);
    await experience.page.goto(url.href);
    await experience.toProcessSocialSignIn({
      socialUserId,
      clickButton: false,
    });

    // Redirected back to the social callback page
    experience.toMatchUrl(new RegExp(appendPath(new URL(logtoUrl), 'callback/social/.*').href));

    // Should have popped up the terms of use and privacy policy dialog
    await experience.toMatchElement([dmodal(), dcls('content')].join(' '), {
      text: /terms of use/i,
    });
    await experience.toClickButton(/agree/i);

    experience.toMatchUrl(demoAppUrl);
    await experience.toClick('div[role=button]', /sign out/i);
    await experience.page.close();
  });

  devFeatureTest.it(
    'should return a denied direct sign-in to the client with access_denied',
    async () => {
      const experience = new ExpectExperience(await browser.newPage());
      const url = new URL(demoAppUrl);

      url.searchParams.set('direct_sign_in', `social:${mockSocialConnectorTarget}`);

      const oidcAuthRequest = experience.page.waitForRequest((request) =>
        request.url().startsWith(`${logtoUrl}/oidc/auth`)
      );
      const authPageRequest = experience.page.waitForRequest((request) =>
        request.url().startsWith(mockSocialAuthPageUrl)
      );
      await experience.page.goto(url.href);

      const oidcAuthRequestResult = await oidcAuthRequest;
      const oidcAuthUrl = new URL(oidcAuthRequestResult.url());
      const oidcState = oidcAuthUrl.searchParams.get('state');
      const authRequest = await authPageRequest;
      const authUrl = new URL(authRequest.url());
      const redirectUri = authUrl.searchParams.get('redirect_uri');
      const socialState = authUrl.searchParams.get('state');

      expect(oidcState).toBeTruthy();
      expect(redirectUri).toBeTruthy();
      expect(socialState).toBeTruthy();

      // Simulate the IdP denying the authorization request.
      const callbackUrl = new URL(redirectUri!);
      callbackUrl.searchParams.set('state', socialState!);
      callbackUrl.searchParams.set('error', 'access_denied');
      await experience.navigateTo(callbackUrl.href);

      await experience.page.waitForFunction(
        (pathname) => window.location.pathname === pathname,
        {},
        new URL(demoAppUrl).pathname
      );

      const finalUrl = new URL(experience.page.url());
      expect(finalUrl.searchParams.get('error')).toBe('access_denied');
      expect(finalUrl.searchParams.get('error_description')).toBeTruthy();
      expect(finalUrl.searchParams.get('state')).toBe(oidcState);
      expect(finalUrl.searchParams.get('iss')).toBe(`${logtoUrl}/oidc`);

      await experience.page.close();
    }
  );

  it('should be landed to the sso identity provider directly', async () => {
    const experience = new ExpectExperience(await browser.newPage());
    const url = new URL(demoAppUrl);
    const socialUserId = 'foo_' + randomString();

    url.searchParams.set('direct_sign_in', `sso:${context.ssoConnectorId!}`);
    await experience.page.goto(url.href);
    await experience.toProcessSocialSignIn({
      socialUserId,
      clickButton: false,
      authUrl: ssoOidcIssuer + '/auth',
    });

    // The SSO sign-in flow won't succeed, but the user should be redirected back to the demo app
    // with the code and user ID in the query string.
    const callbackUrl = new URL(experience.page.url());
    expect(callbackUrl.searchParams.get('code')).toBe('mock-code');
    expect(callbackUrl.searchParams.get('userId')).toBe(socialUserId);
    expect(new URL(callbackUrl.pathname, callbackUrl.origin).href).toBe(demoAppUrl.href);

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
