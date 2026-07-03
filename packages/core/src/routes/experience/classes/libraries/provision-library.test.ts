import {
  adminConsoleApplicationId,
  adminTenantId,
  OrganizationInvitationStatus,
  type CreateUser,
  type User,
  UsersPasswordEncryptionMethod,
  userMfaDataKey,
  userOnboardingDataKey,
} from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type InsertUserResult } from '#src/libraries/user.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../../types.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

mockEsm('#src/utils/tenant.js', () => ({
  getTenantId: () => [adminTenantId],
}));

const { ProvisionLibrary } = await import('./provision-library.js');

const encryptedTokenSet = {
  encryptedTokenSetBase64: 'encrypted-token-set',
  metadata: {
    hasRefreshToken: true,
  },
};

const createProvisionLibrary = ({
  invitations = [],
}: {
  invitations?: Array<{ status: OrganizationInvitationStatus }>;
} = {}) => {
  const hasActiveUsers = jest.fn().mockResolvedValue(true);
  const checkIdentifierCollision = jest.fn();
  const generateUserId = jest.fn().mockResolvedValue('uid');
  const insertUser = jest.fn(async (user: CreateUser): Promise<InsertUserResult> => [user as User]);
  const provisionOrganizations = jest.fn().mockResolvedValue([]);
  const upsertSocialTokenSetSecret = jest.fn();
  const upsertEnterpriseSsoTokenSetSecret = jest.fn();
  const findEntities = jest.fn().mockResolvedValue(invitations);
  const findUserSsoIdentityBySsoIdentityId = jest.fn().mockResolvedValue(null);
  const insertUserSsoIdentity = jest.fn();
  const updateDefaultSignInExperience = jest.fn();

  const tenant = new MockTenant(
    createMockProvider(
      jest.fn().mockResolvedValue({ params: { client_id: adminConsoleApplicationId } })
    ),
    {
      users: {
        hasActiveUsers,
      },
      signInExperiences: {
        updateDefaultSignInExperience,
      },
      organizations: {
        // @ts-expect-error -- only `findEntities` is needed by these tests.
        invitations: { findEntities },
      },
      userSsoIdentities: {
        findUserSsoIdentityBySsoIdentityId,
        insert: insertUserSsoIdentity,
      },
    },
    undefined,
    {
      users: {
        checkIdentifierCollision,
        generateUserId,
        insertUser,
        provisionOrganizations,
      },
      socials: {
        upsertSocialTokenSetSecret,
      },
      ssoConnectors: {
        upsertEnterpriseSsoTokenSetSecret,
      },
    }
  );

  // @ts-expect-error -- mock test context
  const ctx: WithHooksAndLogsContext = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
  };

  return {
    provisionLibrary: new ProvisionLibrary(tenant, ctx),
    ctx,
    hasActiveUsers,
    checkIdentifierCollision,
    insertUser,
    provisionOrganizations,
    upsertSocialTokenSetSecret,
    upsertEnterpriseSsoTokenSetSecret,
    findEntities,
    findUserSsoIdentityBySsoIdentityId,
    updateDefaultSignInExperience,
  };
};

describe('ProvisionLibrary', () => {
  const originalIsCloud = EnvSet.values.isCloud;
  const originalIsIntegrationTest = EnvSet.values.isIntegrationTest;

  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isCloud: boolean; isIntegrationTest: boolean }).isCloud = originalIsCloud;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isCloud: boolean; isIntegrationTest: boolean }).isIntegrationTest =
      originalIsIntegrationTest;
  });

  describe('createUser', () => {
    it('checks identifiers and preserves create side effects', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      (EnvSet.values as { isCloud: boolean; isIntegrationTest: boolean }).isCloud = false;
      // eslint-disable-next-line @silverhand/fp/no-mutation
      (EnvSet.values as { isCloud: boolean; isIntegrationTest: boolean }).isIntegrationTest = false;

      const {
        provisionLibrary,
        ctx,
        hasActiveUsers,
        checkIdentifierCollision,
        insertUser,
        provisionOrganizations,
        upsertSocialTokenSetSecret,
        upsertEnterpriseSsoTokenSetSecret,
        updateDefaultSignInExperience,
      } = createProvisionLibrary();

      await provisionLibrary.createUser(
        {
          name: 'Jane Doe',
          username: 'jane',
          primaryEmail: 'jane@example.com',
          primaryPhone: '+1234567890',
          customData: {
            plan: 'pro',
            upstreamId: 'user-1',
          },
          passwordEncrypted: 'hashed-password',
          passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
          socialIdentity: {
            target: 'google',
            userInfo: {
              id: 'google-user-id',
              email: 'jane@example.com',
            },
          },
          jitOrganizationIds: ['jit-organization-id'],
          socialConnectorTokenSetSecret: {
            encryptedTokenSet,
            socialConnectorRelationPayload: {
              connectorId: 'google',
              target: 'google',
              identityId: 'google-user-id',
            },
          },
          enterpriseSsoConnectorTokenSetSecret: {
            encryptedTokenSet,
            enterpriseSsoConnectorRelationPayload: {
              ssoConnectorId: 'sso-connector-id',
              issuer: 'https://sso.example.com',
              identityId: 'sso-user-id',
            },
          },
        },
        {
          checkIdentifierCollision: true,
          mergeCustomData: true,
        }
      );

      expect(checkIdentifierCollision).toHaveBeenCalledWith({
        username: 'jane',
        primaryEmail: 'jane@example.com',
        primaryPhone: '+1234567890',
        identity: {
          target: 'google',
          id: 'google-user-id',
        },
      });
      expect(Number(checkIdentifierCollision.mock.invocationCallOrder[0])).toBeLessThan(
        Number(insertUser.mock.invocationCallOrder[0])
      );

      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'uid',
          name: 'Jane Doe',
          username: 'jane',
          primaryEmail: 'jane@example.com',
          primaryPhone: '+1234567890',
          customData: {
            plan: 'pro',
            upstreamId: 'user-1',
          },
          identities: {
            google: {
              userId: 'google-user-id',
              details: {
                id: 'google-user-id',
                email: 'jane@example.com',
              },
            },
          },
          logtoConfig: {
            [userMfaDataKey]: {
              enabled: false,
            },
          },
          passwordEncrypted: 'hashed-password',
          passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
          isPasswordExpired: false,
        }),
        {
          roleNames: ['user'],
          isInteractive: true,
        }
      );

      expect(hasActiveUsers).toHaveBeenCalled();
      expect(updateDefaultSignInExperience).not.toHaveBeenCalled();
      expect(provisionOrganizations).toHaveBeenCalledWith({
        userId: 'uid',
        organizationIds: ['jit-organization-id'],
      });
      expect(provisionOrganizations).toHaveBeenCalledWith({
        userId: 'uid',
        email: 'jane@example.com',
      });
      expect(upsertSocialTokenSetSecret).toHaveBeenCalledWith('uid', {
        encryptedTokenSet,
        socialConnectorRelationPayload: {
          connectorId: 'google',
          target: 'google',
          identityId: 'google-user-id',
        },
      });
      expect(upsertEnterpriseSsoTokenSetSecret).toHaveBeenCalledWith(
        'uid',
        {
          encryptedTokenSet,
          enterpriseSsoConnectorRelationPayload: {
            ssoConnectorId: 'sso-connector-id',
            issuer: 'https://sso.example.com',
            identityId: 'sso-user-id',
          },
        },
        ctx
      );
      expect(ctx.appendDataHookContext).toHaveBeenCalledWith('User.Created', {
        user: expect.objectContaining({
          id: 'uid',
        }) as User,
      });
    });

    it('merges hook customData with internally generated onboarding customData', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      (EnvSet.values as { isCloud: boolean }).isCloud = true;

      const { provisionLibrary, insertUser, findEntities } = createProvisionLibrary({
        invitations: [{ status: OrganizationInvitationStatus.Pending }],
      });

      await provisionLibrary.createUser(
        {
          primaryEmail: 'jane@example.com',
          customData: {
            plan: 'pro',
            upstreamId: 'user-1',
          },
        },
        {
          checkIdentifierCollision: true,
          mergeCustomData: true,
        }
      );

      expect(findEntities).toHaveBeenCalledWith({
        invitee: 'jane@example.com',
      });
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          customData: {
            plan: 'pro',
            upstreamId: 'user-1',
            [userOnboardingDataKey]: {
              isOnboardingDone: true,
            },
          },
          logtoConfig: {
            [userMfaDataKey]: {
              enabled: false,
            },
          },
        }),
        expect.anything()
      );
    });

    it('preserves internally generated onboarding customData when hook customData conflicts', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      (EnvSet.values as { isCloud: boolean }).isCloud = true;

      const { provisionLibrary, insertUser } = createProvisionLibrary({
        invitations: [{ status: OrganizationInvitationStatus.Pending }],
      });

      await provisionLibrary.createUser(
        {
          primaryEmail: 'jane@example.com',
          customData: {
            [userOnboardingDataKey]: {
              isOnboardingDone: false,
            },
          },
        },
        {
          mergeCustomData: true,
        }
      );

      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({
          customData: {
            [userOnboardingDataKey]: {
              isOnboardingDone: true,
            },
          },
        }),
        expect.anything()
      );
    });

    it('checks enterprise SSO identity collision before inserting the user', async () => {
      const {
        provisionLibrary,
        checkIdentifierCollision,
        findUserSsoIdentityBySsoIdentityId,
        insertUser,
      } = createProvisionLibrary();

      await provisionLibrary.createUser(
        {
          enterpriseSsoIdentity: {
            ssoConnectorId: 'sso-connector-id',
            issuer: 'https://sso.example.com',
            identityId: 'sso-user-id',
            detail: {},
          },
        },
        {
          checkIdentifierCollision: true,
        }
      );

      expect(checkIdentifierCollision).toHaveBeenCalled();
      expect(findUserSsoIdentityBySsoIdentityId).toHaveBeenCalledWith(
        'https://sso.example.com',
        'sso-user-id'
      );
      expect(Number(findUserSsoIdentityBySsoIdentityId.mock.invocationCallOrder[0])).toBeLessThan(
        Number(insertUser.mock.invocationCallOrder[0])
      );
    });

    it('propagates enterprise SSO identity collision errors without inserting the user', async () => {
      const { provisionLibrary, findUserSsoIdentityBySsoIdentityId, insertUser } =
        createProvisionLibrary();

      findUserSsoIdentityBySsoIdentityId.mockResolvedValueOnce({
        id: 'existing-sso-identity-id',
      });

      await expect(
        provisionLibrary.createUser(
          {
            enterpriseSsoIdentity: {
              ssoConnectorId: 'sso-connector-id',
              issuer: 'https://sso.example.com',
              identityId: 'sso-user-id',
              detail: {},
            },
          },
          {
            checkIdentifierCollision: true,
          }
        )
      ).rejects.toMatchObject({
        code: 'user.identity_already_in_use',
        status: 422,
      });

      expect(insertUser).not.toHaveBeenCalled();
    });

    it('propagates identifier collision errors without inserting the user', async () => {
      const error = new RequestError({ code: 'user.email_already_in_use', status: 422 });
      const { provisionLibrary, checkIdentifierCollision, insertUser } = createProvisionLibrary();

      checkIdentifierCollision.mockRejectedValueOnce(error);

      await expect(
        provisionLibrary.createUser(
          {
            primaryEmail: 'jane@example.com',
          },
          {
            checkIdentifierCollision: true,
            mergeCustomData: true,
          }
        )
      ).rejects.toBe(error);

      expect(insertUser).not.toHaveBeenCalled();
    });
  });
});
