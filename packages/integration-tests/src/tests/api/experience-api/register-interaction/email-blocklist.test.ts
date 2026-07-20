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
import { signInWithPassword } from '#src/helpers/experience/index.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
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
    await Promise.all([
      ssoConnectorApi.cleanUp(),
      updateSignInExperience({
        emailBlocklistPolicy: {
          blockSubaddressing: false,
          customBlocklist: [],
        },
      }),
    ]);
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

  describe('wildcard email blocklist entries', () => {
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

devFeatureTest.describe('should enforce the email allowlist for new email registrations', () => {
  const exactAllowedEmail = generateEmail('allowlist-exact.com');
  const allowedDomain = 'allowlist-domain.com';
  const wildcardLocalPartDomain = 'allowlist-local.com';
  const wildcardDomainRoot = 'allowlist-wildcard.com';
  const blockedAllowedEmail = `blocked@${allowedDomain}`;
  const subaddressedAllowedEmail = `foo+bar@${allowedDomain}`;
  const customAllowlist = [
    exactAllowedEmail,
    `@${allowedDomain}`,
    `foo*@${wildcardLocalPartDomain}`,
    `@*.${wildcardDomainRoot}`,
  ];

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    });
    await updateSignInExperience({
      emailBlocklistPolicy: {
        blockSubaddressing: false,
        customAllowlist,
        customBlocklist: [],
      },
    });
  });

  afterAll(async () => {
    await updateSignInExperience({
      emailBlocklistPolicy: {
        blockSubaddressing: false,
        customAllowlist: [],
        customBlocklist: [],
      },
    });
  });

  it('should reject verification code send when the email does not match the allowlist', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier: {
          type: SignInIdentifier.Email,
          value: generateEmail('not-allowed.com'),
        },
        interactionEvent: InteractionEvent.Register,
      }),
      emailNotAllowedError
    );
  });

  it.each([
    ['exact email', exactAllowedEmail],
    ['domain item', generateEmail(allowedDomain)],
    ['wildcard local-part item', `foobar@${wildcardLocalPartDomain}`],
    ['wildcard domain item', `bar@foo.${wildcardDomainRoot}`],
  ])('should allow verification code send for an allowlist %s match', async (_label, email) => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expect(
      client.sendVerificationCode({
        identifier: {
          type: SignInIdentifier.Email,
          value: email,
        },
        interactionEvent: InteractionEvent.Register,
      })
    ).resolves.toHaveProperty('verificationId');
  });

  it('should still reject an allowlisted email matched by a custom block rule', async () => {
    await updateSignInExperience({
      emailBlocklistPolicy: {
        blockSubaddressing: false,
        customAllowlist,
        customBlocklist: [blockedAllowedEmail],
      },
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier: {
          type: SignInIdentifier.Email,
          value: blockedAllowedEmail,
        },
        interactionEvent: InteractionEvent.Register,
      }),
      emailNotAllowedError
    );
  });

  it('should still reject an allowlisted email with subaddressing when subaddressing is blocked', async () => {
    await updateSignInExperience({
      emailBlocklistPolicy: {
        blockSubaddressing: true,
        customAllowlist,
        customBlocklist: [],
      },
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.Register,
    });

    await expectRejects(
      client.sendVerificationCode({
        identifier: {
          type: SignInIdentifier.Email,
          value: subaddressedAllowedEmail,
        },
        interactionEvent: InteractionEvent.Register,
      }),
      {
        code: 'session.email_blocklist.email_subaddressing_not_allowed',
        status: 422,
      }
    );
  });

  it('should allow existing users to sign in with a non-allowlisted email', async () => {
    const primaryEmail = generateEmail('existing-user.com');
    const { user, password } = await createDefaultTenantUserWithPassword({ primaryEmail });

    try {
      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Email,
          value: primaryEmail,
        },
        password,
      });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });
});
