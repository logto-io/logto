import { ConnectorType, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { setAlwaysFailCaptcha, setAlwaysPassCaptcha } from '#src/helpers/captcha.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  registerNewUserUsernamePassword,
  signInWithEnterpriseSso,
  signInWithPassword,
  signInWithSocial,
} from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  disableCaptcha,
  enableAllPasswordSignInMethods,
  enableCaptcha,
} from '#src/helpers/sign-in-experience.js';
import { UserApiTest, generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('captcha', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      passwordPolicy: {},
    });
    await enableCaptcha();
    await setAlwaysPassCaptcha();
  });

  afterEach(async () => {
    await setAlwaysPassCaptcha();
  });

  afterAll(async () => {
    await disableCaptcha();
  });

  describe('basic sign in and captcha verification failure', () => {
    it('should sign-in successfully with captcha token', async () => {
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
      });

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: userProfile.username,
        },
        password: userProfile.password,
        captchaToken: 'captcha-token',
      });

      await deleteUser(user.id);
    });

    it('should fail to sign-in if no captcha token', async () => {
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
      });

      await expectRejects(
        signInWithPassword({
          identifier: {
            type: SignInIdentifier.Username,
            value: userProfile.username,
          },
          password: userProfile.password,
        }),
        {
          code: 'session.captcha_required',
          status: 422,
        }
      );

      await deleteUser(user.id);
    });

    it('should fail to sign-in if captcha token is invalid', async () => {
      await setAlwaysFailCaptcha();
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
      });

      await expectRejects(
        signInWithPassword({
          identifier: { type: SignInIdentifier.Username, value: userProfile.username },
          password: userProfile.password,
          captchaToken: 'captcha-token',
        }),
        {
          code: 'session.captcha_failed',
          status: 422,
        }
      );

      await deleteUser(user.id);
    });
  });

  describe('register', () => {
    it('should register successfully with captcha token', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const userId = await registerNewUserUsernamePassword(username, password, 'captcha-token');

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Username,
          value: username,
        },
        password,
        captchaToken: 'captcha-token',
      });

      await deleteUser(userId);
    });

    it('should fail to register if no captcha token is provided', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await expectRejects(registerNewUserUsernamePassword(username, password), {
        code: 'session.captcha_required',
        status: 422,
      });

      // Register again with the same username, ensure the user is not created
      const userId = await registerNewUserUsernamePassword(username, password, 'captcha-token');
      await deleteUser(userId);
    });
  });

  describe('social verification', () => {
    const connectorIdMap = new Map<string, string>();
    const socialUserId = generateStandardId();

    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
      const { id: socialConnectorId } = await setSocialConnector();
      connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
      await updateSignInExperience({
        signUp: {
          identifiers: [],
          password: true,
          verify: false,
        },
        passwordPolicy: {},
      });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
    });

    it('should skip captcha for social registration', async () => {
      const userId = await signInWithSocial(
        connectorIdMap.get(mockSocialConnectorId)!,
        {
          id: socialUserId,
        },
        {
          registerNewUser: true,
        }
      );
      await deleteUser(userId);
    });
  });

  describe('enterprise sso verification', () => {
    const ssoConnectorApi = new SsoConnectorApi();
    const domain = 'foo.com';
    const enterpriseSsoIdentityId = generateStandardId();
    const email = generateEmail(domain);
    const userApi = new UserApiTest();

    beforeAll(async () => {
      await ssoConnectorApi.createMockOidcConnector([domain]);
      await updateSignInExperience({
        singleSignOnEnabled: true,
        signUp: { identifiers: [], password: false, verify: false },
      });
    });

    afterAll(async () => {
      await Promise.all([ssoConnectorApi.cleanUp(), userApi.cleanUp()]);
    });

    it('should skip captcha for enterprise sso verification', async () => {
      const userId = await signInWithEnterpriseSso(
        ssoConnectorApi.firstConnectorId!,
        {
          sub: enterpriseSsoIdentityId,
          email,
          email_verified: true,
        },
        true
      );
      await deleteUser(userId);
    });
  });
});
