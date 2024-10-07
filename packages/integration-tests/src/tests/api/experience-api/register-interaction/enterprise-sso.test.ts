import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import {
  successFullyCreateSocialVerification,
  successFullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { UserApiTest } from '#src/helpers/user.js';
import { generateEmail } from '#src/utils.js';

describe('should reject the email registration if the email domain is enabled for SSO only', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const domain = 'foo.com';
  const email = generateEmail(domain);
  const userApi = new UserApiTest();
  const identifier = Object.freeze({ type: SignInIdentifier.Email, value: email });

  beforeAll(async () => {
    await Promise.all([setEmailConnector(), ssoConnectorApi.createMockOidcConnector([domain])]);
    await updateSignInExperience({
      singleSignOnEnabled: true,
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
    });
  });

  afterAll(async () => {
    await Promise.all([ssoConnectorApi.cleanUp(), userApi.cleanUp()]);
  });

  it('should block email verification code registration', async () => {
    const client = await initExperienceClient(InteractionEvent.Register);

    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier,
      interactionEvent: InteractionEvent.Register,
    });

    await successfullyVerifyVerificationCode(client, {
      identifier,
      verificationId,
      code,
    });

    await expectRejects(
      client.identifyUser({
        verificationId,
      }),
      {
        code: `session.sso_enabled`,
        status: 422,
      }
    );
  });

  it('should block email profile update', async () => {
    const client = await initExperienceClient(InteractionEvent.Register);

    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier,
      interactionEvent: InteractionEvent.Register,
    });

    await successfullyVerifyVerificationCode(client, {
      identifier,
      verificationId,
      code,
    });

    await expectRejects(
      client.updateProfile({
        type: SignInIdentifier.Email,
        verificationId,
      }),
      {
        code: `session.sso_enabled`,
        status: 422,
      }
    );
  });

  describe('social register and link account', () => {
    const connectorIdMap = new Map<string, string>();
    const state = 'state';
    const redirectUri = 'http://localhost:3000';
    const socialUserId = generateStandardId();

    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
      const { id: socialConnectorId } = await setSocialConnector();
      connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
    });

    it('should block social register with SSO only email identifier', async () => {
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;
      const client = await initExperienceClient(InteractionEvent.Register);

      const { verificationId } = await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await successFullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          state,
          redirectUri,
          code: 'fake_code',
          userId: socialUserId,
          email,
        },
      });

      await expectRejects(
        client.identifyUser({
          verificationId,
        }),
        {
          code: `session.sso_enabled`,
          status: 422,
        }
      );
    });

    it('should block social link email with SSO only email identifier', async () => {
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;
      const client = await initExperienceClient(InteractionEvent.Register);

      const { verificationId } = await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await successFullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          state,
          redirectUri,
          code: 'fake_code',
          userId: socialUserId,
        },
      });

      await expectRejects(client.identifyUser({ verificationId }), {
        code: 'user.missing_profile',
        status: 422,
      });

      const { code, verificationId: emailVerificationId } = await successfullySendVerificationCode(
        client,
        {
          identifier,
          interactionEvent: InteractionEvent.Register,
        }
      );

      await successfullyVerifyVerificationCode(client, {
        identifier,
        verificationId: emailVerificationId,
        code,
      });

      await expectRejects(
        client.updateProfile({
          type: SignInIdentifier.Email,
          verificationId: emailVerificationId,
        }),
        {
          code: `session.sso_enabled`,
          status: 422,
        }
      );
    });
  });
});
