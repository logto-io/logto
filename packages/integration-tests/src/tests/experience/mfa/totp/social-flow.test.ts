import { ConnectorType } from '@logto/connector-kit';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import { enableMandatoryMfaWithTotp, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { generateUserId } from '#src/utils.js';

import TotpTestingContext from './totp-testing-context.js';

describe('MFA - TOTP', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await setSocialConnector();
    await updateSignInExperience({
      signUp: { identifiers: [], password: false, verify: false }, // Social only account creation
      signIn: {
        methods: [],
      },
      socialSignInConnectorTargets: ['mock-social'],
    });
    await enableMandatoryMfaWithTotp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('social flow', () => {
    const context = new TotpTestingContext();

    it('should bind TOTP when registering', async () => {
      context.setUpSocialUserId(generateUserId());
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toProcessSocialSignIn({ socialUserId: context.socialUserId });
      context.setUpTotpSecret(await experience.toBindTotp());
      await experience.verifyThenEnd();
    });

    it('should verify TOTP when signing in', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toProcessSocialSignIn({ socialUserId: context.socialUserId });
      await experience.toVerifyTotp(context.totpSecret);
      const userId = await experience.getUserIdFromDemoAppPage();
      await experience.verifyThenEnd();

      // Clean up
      await deleteUser(userId);
    });

    it('should bind TOTP if an existing user has no TOTP when linking social', async () => {
      const socialUserId = generateUserId();
      const { userProfile, user } = await generateNewUser({ primaryEmail: true });
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toProcessSocialSignIn({
        socialUserId,
        socialEmail: userProfile.primaryEmail,
      });
      await experience.toClick('button', /Link with/);
      await experience.toBindTotp();
      await experience.verifyThenEnd();
      await deleteUser(user.id);
    });

    it('should bind TOTP when registering without determining to link with an existing account', async () => {
      const socialUserId = generateUserId();
      const { userProfile, user } = await generateNewUser({ primaryEmail: true });
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toProcessSocialSignIn({
        socialUserId,
        socialEmail: userProfile.primaryEmail,
      });
      await experience.toClick('a', 'Create new one instead');
      await experience.toBindTotp();
      await experience.verifyThenEnd();
      await deleteUser(user.id);
    });
  });
});
