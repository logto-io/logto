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
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateEmail } from '#src/utils.js';

describe('should reject the email registration if the email is in the blocklist', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const ssoDomain = 'sso.com';
  const blockDomain = 'block.com';
  const ssoEmail = generateEmail(ssoDomain);
  const blockEmail = generateEmail(blockDomain);

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
  });

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Social]);
    await setEmailConnector();
    await updateSignInExperience({
      singleSignOnEnabled: true,
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
      emailBlocklistPolicy: {
        blockSubaddressing: true,
        customBlocklist: [`@${blockDomain}`, ssoEmail],
      },
    });
  });

  it('should reject subaddressing email', async () => {
    const identifier = Object.freeze({
      type: SignInIdentifier.Email,
      value: 'foo+test@bar.com',
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier,
        interactionEvent: InteractionEvent.Register,
      }),
      {
        code: 'session.email_blocklist.email_subaddressing_not_allowed',
        status: 422,
      }
    );
  });

  it('should reject email with domain in the custom blocklist', async () => {
    const identifier = Object.freeze({
      type: SignInIdentifier.Email,
      value: blockEmail,
    });

    const errorCode = 'session.email_blocklist.email_not_allowed';

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier,
        interactionEvent: InteractionEvent.Register,
      }),
      {
        code: errorCode,
        status: 422,
      }
    );
  });

  describe('should reject the social registraction if the email is in the blocklist', () => {
    const connectorIdMap = new Map<string, string>();
    const state = 'state';
    const redirectUri = 'http://localhost:3000';
    const socialUserId = generateStandardId();

    beforeAll(async () => {
      const { id: socialConnectorId } = await setSocialConnector();
      connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
    });

    it('should reject social register if the provided email is in the blocklist', async () => {
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await successfullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          state,
          redirectUri,
          code: 'fake_code',
          userId: socialUserId,
          email: blockEmail,
        },
      });

      await expectRejects(
        client.identifyUser({
          verificationId,
        }),
        {
          code: 'session.email_blocklist.email_not_allowed',
          status: 422,
        }
      );
    });
  });
});
