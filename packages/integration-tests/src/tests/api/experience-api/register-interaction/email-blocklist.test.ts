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
import { devFeatureTest, generateEmail } from '#src/utils.js';

const emailNotAllowedError = {
  code: 'session.email_blocklist.email_not_allowed',
  status: 422,
} as const;

describe('should reject the email registration if the email is in the blocklist', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const ssoDomain = 'sso.com';
  const blockDomain = 'block.com';
  const exactBlocklistEmail = `ExactBlocked@${ssoDomain}`;
  const exactBlockedEmail = exactBlocklistEmail.toLowerCase();
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
        customBlocklist: [`@${blockDomain.toUpperCase()}`, exactBlocklistEmail],
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

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier,
        interactionEvent: InteractionEvent.Register,
      }),
      emailNotAllowedError
    );
  });

  it('should reject email with exact address in the custom blocklist case-insensitively', async () => {
    const identifier = Object.freeze({
      type: SignInIdentifier.Email,
      value: exactBlockedEmail,
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier,
        interactionEvent: InteractionEvent.Register,
      }),
      emailNotAllowedError
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
        emailNotAllowedError
      );
    });
  });

  devFeatureTest.describe('wildcard email blocklist entries', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        emailBlocklistPolicy: {
          blockSubaddressing: true,
          customBlocklist: [
            `@${blockDomain.toUpperCase()}`,
            exactBlocklistEmail,
            'foo*@example.com',
            '@foo.*',
          ],
        },
      });
    });

    it('should reject email matched by a wildcard local part blocklist entry', async () => {
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await expectRejects(
        client.sendVerificationCode({
          identifier: {
            type: SignInIdentifier.Email,
            value: 'foobar@example.com',
          },
          interactionEvent: InteractionEvent.Register,
        }),
        emailNotAllowedError
      );
    });

    it('should reject email matched by a wildcard domain blocklist entry', async () => {
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await expectRejects(
        client.sendVerificationCode({
          identifier: {
            type: SignInIdentifier.Email,
            value: 'bar@foo.dev',
          },
          interactionEvent: InteractionEvent.Register,
        }),
        emailNotAllowedError
      );
    });

    it('should allow email that does not match any wildcard blocklist entry', async () => {
      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await expect(
        client.sendVerificationCode({
          identifier: {
            type: SignInIdentifier.Email,
            value: 'bar@example.com',
          },
          interactionEvent: InteractionEvent.Register,
        })
      ).resolves.toHaveProperty('verificationId');
    });
  });
});
