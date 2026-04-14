import crypto from 'node:crypto';

import { ConnectorType } from '@logto/connector-kit';
import { AgreeToTermsPolicy, SignInMode } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl, mockSocialAuthPageUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';

const randomString = () => crypto.randomBytes(8).toString('hex');

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 *
 * Tests the localStorage-based fallback mechanism for social sign-in when
 * sessionStorage is lost (e.g., in-app browsers opening a new WebView for OAuth).
 */
describe('social sign-in session fallback', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let experience: ExpectExperience;
  const socialUserId = 'fallback_' + randomString();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setSocialConnector();

    await updateSignInExperience({
      termsOfUseUrl: '',
      privacyPolicyUrl: '',
      agreeToTermsPolicy: AgreeToTermsPolicy.ManualRegistrationOnly,
      signUp: { identifiers: [], password: false, verify: false },
      signIn: {
        methods: [],
      },
      signInMode: SignInMode.SignInAndRegister,
      socialSignInConnectorTargets: ['mock-social'],
    });
  });

  it('should register a new social user for subsequent fallback test', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toProcessSocialSignIn({ socialUserId });
    await experience.verifyThenEnd();
  });

  it('should recover social sign-in via localStorage fallback when sessionStorage is lost', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');

    // --- Manually replicate the social sign-in initiation ---
    // 1. Listen for the auth page request
    const authPageRequestListener = experience.page.waitForRequest((request) =>
      request.url().startsWith(mockSocialAuthPageUrl)
    );

    // 2. Click the social button
    await experience.toClick('button', 'Continue with Mock Social');

    // 3. Intercept to extract redirect_uri and state
    const result = await authPageRequestListener;
    const { searchParams } = new URL(result.url());
    const redirectUri = searchParams.get('redirect_uri') ?? '';
    const state = searchParams.get('state') ?? '';

    // 4. Inject a one-time script that clears the experience app's social auth state from
    //    sessionStorage before the callback page's app code runs.
    //    This simulates in-app browsers losing sessionStorage across redirects.
    //    We only clear `social_auth_state:*` keys (not all of sessionStorage) to avoid
    //    wiping the demo app's OIDC PKCE code_verifier on subsequent redirects.
    const { identifier } = await experience.page.evaluateOnNewDocument(() => {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith('social_auth_state:')) {
          sessionStorage.removeItem(key);
        }
      }
    });

    // 5. Navigate to the callback URL (simulating IdP redirect back)
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('state', state);
    callbackUrl.searchParams.set('code', 'mock-code');
    callbackUrl.searchParams.set('userId', socialUserId);

    await experience.navigateTo(callbackUrl.toString());

    // Remove the injected script so it doesn't fire on subsequent navigations
    await experience.page.removeScriptToEvaluateOnNewDocument(identifier);

    // 6. The fallback should restore the session from localStorage and complete sign-in
    await experience.verifyThenEnd();
  });

  it('should show error when sessionStorage is lost and no localStorage fallback exists', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');

    const authPageRequestListener = experience.page.waitForRequest((request) =>
      request.url().startsWith(mockSocialAuthPageUrl)
    );

    await experience.toClick('button', 'Continue with Mock Social');

    const result = await authPageRequestListener;
    const { searchParams } = new URL(result.url());
    const redirectUri = searchParams.get('redirect_uri') ?? '';
    const state = searchParams.get('state') ?? '';

    // Clear social auth state from sessionStorage AND the fallback from localStorage
    const { identifier } = await experience.page.evaluateOnNewDocument(() => {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith('social_auth_state:')) {
          sessionStorage.removeItem(key);
        }
      }
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('logto:redirect-context:fallback:')) {
          localStorage.removeItem(key);
        }
      }
    });

    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('state', state);
    callbackUrl.searchParams.set('code', 'mock-code');
    callbackUrl.searchParams.set('userId', socialUserId);

    await experience.navigateTo(callbackUrl.toString());
    await experience.page.removeScriptToEvaluateOnNewDocument(identifier);

    // Should show an error toast and redirect to sign-in
    await experience.waitForToast(/invalid/);
    experience.toBeAt('sign-in');
  });
});
