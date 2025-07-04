import { UserScope } from '@logto/core-kit';
import { ConnectorType } from '@logto/schemas';

import {
  mockEmailConnectorId,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { getUserIdentityTokenSetRecord } from '#src/api/admin-user.js';
import { updateConnectorConfig } from '#src/api/connector.js';
import { deleteIdentity, getUserInfo, updateIdentities } from '#src/api/my-account.js';
import {
  createSocialVerificationRecord,
  createVerificationRecordByPassword,
  verifySocialAuthorization,
} from '#src/api/verification-record.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';

describe('my-account (social)', () => {
  const state = 'fake_state';
  const redirectUri = 'http://localhost:3000/redirect';
  const authorizationCode = 'fake_code';
  const connectorIdMap = new Map<string, string>();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();

    await clearConnectorsByTypes([ConnectorType.Social]);

    const [{ id: socialConnectorId }, { id: emailConnectorId }] = await Promise.all([
      setSocialConnector(),
      setEmailConnector(),
    ]);

    connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
    connectorIdMap.set(mockEmailConnectorId, emailConnectorId);

    // TODO: Remove this once we have token storage enabled
    if (isDevFeaturesEnabled) {
      await updateConnectorConfig(socialConnectorId, {
        enableTokenStorage: true,
      });
    }
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
  });

  describe('POST /my-account/identities', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        updateIdentities(api, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'auth.unauthorized',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      await expectRejects(
        updateIdentities(api, 'invalid-verification-record-id', 'new-verification-record-id'),
        {
          code: 'verification_record.permission_denied',
          status: 401,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if new identifier verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        updateIdentities(api, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'verification_record.not_found',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    describe('create social verification record', () => {
      it('should throw if the connector is not found', async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Profile, UserScope.Identities],
        });
        await expectRejects(
          createSocialVerificationRecord(api, 'invalid-connector-id', state, redirectUri),
          {
            code: 'session.invalid_connector_id',
            status: 422,
          }
        );

        await deleteDefaultTenantUser(user.id);
      });

      it('should throw if the connector is not a social connector', async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Profile, UserScope.Identities],
        });

        await expectRejects(
          createSocialVerificationRecord(
            api,
            connectorIdMap.get(mockEmailConnectorId)!,
            state,
            redirectUri
          ),
          {
            code: 'connector.unexpected_type',
            status: 400,
          }
        );

        await deleteDefaultTenantUser(user.id);
      });

      it('should be able to verify social authorization and update user identities', async () => {
        const { user, username, password } = await createDefaultTenantUserWithPassword();
        const api = await signInAndGetUserApi(username, password, {
          scopes: [UserScope.Profile, UserScope.Identities],
        });

        const mockTokenResponse = {
          access_token: 'access_token',
          expires_in: 3600,
          scope: 'profile',
        };

        const { verificationRecordId: newVerificationRecordId } =
          await createSocialVerificationRecord(
            api,
            connectorIdMap.get(mockSocialConnectorId)!,
            state,
            redirectUri
          );

        await verifySocialAuthorization(api, newVerificationRecordId, {
          code: authorizationCode,
          tokenResponse: mockTokenResponse,
        });

        const verificationRecordId = await createVerificationRecordByPassword(api, password);
        await updateIdentities(api, verificationRecordId, newVerificationRecordId);
        const userInfo = await getUserInfo(api);
        expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

        // TODO: Remove this once we have token storage enabled
        if (isDevFeaturesEnabled) {
          const tokenSetRecord = await getUserIdentityTokenSetRecord(
            user.id,
            mockSocialConnectorTarget
          );
          expect(tokenSetRecord).not.toBeNull();
          expect(tokenSetRecord.metadata.scope).toBe(mockTokenResponse.scope);
        }

        await deleteDefaultTenantUser(user.id);
      });
    });
  });

  describe('DELETE /my-account/identities/:target', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId), {
        code: 'auth.unauthorized',
        status: 400,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if verification record is invalid', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      await expectRejects(
        deleteIdentity(api, mockSocialConnectorTarget, 'invalid-verification-record-id'),
        {
          code: 'verification_record.permission_denied',
          status: 401,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should fail if identity does not exist', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId), {
        code: 'user.identity_not_exist',
        status: 404,
      });

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to delete social identity', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      // Link social identity to the user
      const { verificationRecordId: newVerificationRecordId } =
        await createSocialVerificationRecord(
          api,
          connectorIdMap.get(mockSocialConnectorId)!,
          state,
          redirectUri
        );
      await verifySocialAuthorization(api, newVerificationRecordId, {
        code: authorizationCode,
      });
      await updateIdentities(api, verificationRecordId, newVerificationRecordId);
      const userInfo = await getUserInfo(api);
      expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

      await deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId);

      const updatedUserInfo = await getUserInfo(api);
      expect(updatedUserInfo.identities).not.toHaveProperty(mockSocialConnectorTarget);

      await deleteDefaultTenantUser(user.id);
    });
  });
});
