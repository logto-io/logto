import {
  AgreeToTermsPolicy,
  ApplicationType,
  createDefaultApplicationAccessControl,
} from '@logto/schemas';

import {
  createApplication,
  deleteApplication,
  replaceApplicationAccessControl,
  updateApplication,
} from '#src/api/application.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppRedirectUri, demoAppUrl, logtoUrl } from '#src/constants.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { setUsernamePasswordOnly } from '#src/helpers/sign-in-experience.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { devFeatureTest, generateTestName } from '#src/utils.js';

const createAccessControlledSpaApplication = async (allowedUserId: string) => {
  const application = await createApplication(generateTestName(), ApplicationType.SPA, {
    oidcClientMetadata: {
      redirectUris: [demoAppRedirectUri],
      postLogoutRedirectUris: [demoAppRedirectUri],
    },
  });

  await replaceApplicationAccessControl(application.id, {
    ...createDefaultApplicationAccessControl(),
    userIds: [allowedUserId],
  });
  await updateApplication(application.id, { appLevelAccessControlEnabled: true });

  return application;
};

const buildDemoAppUrl = (applicationId: string) => {
  const url = new URL(demoAppUrl);
  url.searchParams.set('app_id', applicationId);

  return url;
};

const signInFromExperience = async (
  experience: ExpectExperience,
  username: string,
  password: string
) => {
  await experience.toFillForm(
    {
      identifier: username,
      password,
    },
    { submit: true, shouldNavigate: false }
  );
};

const clearExperienceCookies = async (experience: ExpectExperience) => {
  const cookies = await Promise.all([
    experience.page.cookies(logtoUrl),
    experience.page.cookies(demoAppUrl.href),
  ]);

  await experience.page.deleteCookie(...cookies.flat());
};

devFeatureTest.describe('application access control experience', () => {
  beforeAll(async () => {
    await setUsernamePasswordOnly();
    await updateSignInExperience({
      termsOfUseUrl: null,
      privacyPolicyUrl: null,
      agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
    });
  });

  it('allows users that match the app access rules to enter the app', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const application = await createAccessControlledSpaApplication(user.id);
    const experience = new ExpectExperience(await browser.newPage());

    try {
      await clearExperienceCookies(experience);
      await experience.startWith(buildDemoAppUrl(application.id));
      await signInFromExperience(experience, username, password);

      await experience.page.waitForFunction(() => {
        const url = new URL(window.location.href);

        return url.pathname === '/demo-app' && url.searchParams.has('code');
      });
    } finally {
      await Promise.allSettled([
        experience.page.close(),
        deleteApplication(application.id),
        deleteDefaultTenantUser(user.id),
      ]);
    }
  });

  it('shows the generic access denied page when the signed-in user has no app access', async () => {
    const [deniedUser, allowedUser] = await Promise.all([
      createDefaultTenantUserWithPassword(),
      createDefaultTenantUserWithPassword(),
    ]);
    const application = await createAccessControlledSpaApplication(allowedUser.user.id);
    const experience = new ExpectExperience(await browser.newPage());

    try {
      await clearExperienceCookies(experience);
      await experience.startWith(buildDemoAppUrl(application.id));
      await signInFromExperience(experience, deniedUser.username, deniedUser.password);

      await experience.page.waitForFunction(() =>
        document.body.textContent.toLowerCase().includes('access denied')
      );
      await experience.toMatchElement('body', { text: /sign out/i });
    } finally {
      await Promise.allSettled([
        experience.page.close(),
        deleteApplication(application.id),
        deleteDefaultTenantUser(deniedUser.user.id),
        deleteDefaultTenantUser(allowedUser.user.id),
      ]);
    }
  });
});
