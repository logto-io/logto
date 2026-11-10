import { ConnectorType } from '@logto/connector-kit';
import { VerificationType, type User } from '@logto/schemas';

import { mockConnector } from '#src/__mocks__/connector.js';
import { mockUser } from '#src/__mocks__/user.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { identifyUserByVerificationRecord } from './helpers.js';
import { SocialVerification } from './verifications/social-verification.js';

const { jest } = import.meta;
const socialUserInfo = { id: 'incoming-account', email: 'user@example.test', name: 'Incoming' };
const encryptedTokenSet = {
  encryptedTokenSetBase64: 'encrypted-token-set',
  metadata: { scope: 'openid email', hasRefreshToken: true },
};

const createVerification = (identities: User['identities']) => {
  const user = { ...mockUser, primaryEmail: socialUserInfo.email, identities };
  const tenant = new MockTenant(
    undefined,
    {
      users: {
        findUserByIdentity: jest
          .fn()
          .mockResolvedValue(identities.google?.userId === socialUserInfo.id ? user : null),
        findUserByEmail: jest.fn().mockResolvedValue(user),
      },
    },
    undefined,
    {
      socials: {
        getConnector: jest.fn().mockResolvedValue({
          ...mockConnector,
          type: ConnectorType.Social,
          metadata: { ...mockConnector.metadata, target: 'google' },
          dbEntry: { syncProfile: true },
        }),
      },
    }
  );
  const verification = new SocialVerification(tenant.libraries, tenant.queries, {
    id: 'verified-social-account',
    type: VerificationType.Social,
    connectorId: 'google',
    socialUserInfo,
    encryptedTokenSet,
  });
  return { user, verification };
};

describe('social sign-in identity preservation', () => {
  it('authenticates an email match without staging another linked account or its tokens', async () => {
    const { user, verification } = createVerification({ google: { userId: 'linked-account' } });

    await expect(identifyUserByVerificationRecord(verification, true)).resolves.toEqual({ user });
  });

  it('still stages the first identity for a provider when linking an email match', async () => {
    const { user, verification } = createVerification({ github: { userId: 'github-account' } });

    await expect(identifyUserByVerificationRecord(verification, true)).resolves.toMatchObject({
      user,
      syncedProfile: {
        name: socialUserInfo.name,
        socialIdentity: { target: 'google', userInfo: socialUserInfo },
        socialConnectorTokenSetSecret: { encryptedTokenSet },
      },
    });
  });

  it('continues refreshing the linked account profile and tokens on ordinary sign-in', async () => {
    const { user, verification } = createVerification({ google: { userId: socialUserInfo.id } });

    await expect(identifyUserByVerificationRecord(verification, false)).resolves.toEqual({
      user,
      syncedProfile: {
        name: socialUserInfo.name,
        socialConnectorTokenSetSecret: {
          encryptedTokenSet,
          socialConnectorRelationPayload: {
            connectorId: 'google',
            target: 'google',
            identityId: socialUserInfo.id,
          },
        },
      },
    });
  });

  it('does not authenticate an email match when account linking is disabled', async () => {
    const { verification } = createVerification({ google: { userId: 'linked-account' } });

    await expect(identifyUserByVerificationRecord(verification, false)).rejects.toMatchObject({
      code: 'user.identity_not_exist',
    });
  });
});
