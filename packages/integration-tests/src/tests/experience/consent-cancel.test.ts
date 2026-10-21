import { UserScope } from '@logto/core-kit';
import { AgreeToTermsPolicy, ApplicationType } from '@logto/schemas';

import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppRedirectUri, demoAppUrl, logtoUrl } from '#src/constants.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { setUsernamePasswordOnly } from '#src/helpers/sign-in-experience.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { generateTestName } from '#src/utils.js';

const buildDemoAppUrl = (applicationId: string) => {
  const url = new URL(demoAppUrl);
  url.searchParams.set('app_id', applicationId);

  return url;
};

/** Drop the session left by previous tests, so the demo app starts a fresh sign-in. */
const clearExperienceCookies = async (experience: ExpectExperience) => {
  const cookies = await Promise.all([
    experience.page.cookies(logtoUrl),
    experience.page.cookies(demoAppUrl.href),
  ]);

  await experience.page.deleteCookie(...cookies.flat());
};

/**
 * The demo app always requests `openid offline_access profile` plus its configured scopes, so the
 * application must be allowed to ask for them. The scopes are not yet granted, which makes the
 * sign-in land on the consent page.
 */
const createThirdPartyApplication = async () => {
  const application = await createApplication(generateTestName(), ApplicationType.SPA, {
    isThirdParty: true,
    oidcClientMetadata: {
      redirectUris: [demoAppRedirectUri],
      postLogoutRedirectUris: [],
    },
  });

  await assignUserConsentScopes(application.id, {
    userScopes: [UserScope.Profile, UserScope.Organizations, UserScope.OrganizationRoles],
  });

  return application;
};

describe('consent cancel', () => {
  beforeAll(async () => {
    await setUsernamePasswordOnly();
    await updateSignInExperience({
      termsOfUseUrl: null,
      privacyPolicyUrl: null,
      agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
    });
  });

  it('returns access_denied with the original state and issuer when cancelling', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const application = await createThirdPartyApplication();
    const experience = new ExpectExperience(await browser.newPage());

    try {
      await clearExperienceCookies(experience);
      await experience.startWith(buildDemoAppUrl(application.id));
      await experience.toFillForm(
        { identifier: username, password },
        { submit: true, shouldNavigate: false }
      );

      const consentUrl = new URL('/consent', logtoUrl);
      consentUrl.searchParams.set('app_id', application.id);
      await experience.waitForUrl(consentUrl);

      await experience.toClickButton(/cancel/i);

      const url = new URL(experience.page.url());
      expect(`${url.origin}${url.pathname}`).toBe(demoAppRedirectUri);
      expect(url.searchParams.get('error')).toBe('access_denied');
      expect(url.searchParams.get('state')).toBeTruthy();
      expect(url.searchParams.get('iss')).toBe(`${logtoUrl}/oidc`);
    } finally {
      await Promise.allSettled([
        experience.page.close(),
        deleteApplication(application.id),
        deleteDefaultTenantUser(user.id),
      ]);
    }
  });
});
