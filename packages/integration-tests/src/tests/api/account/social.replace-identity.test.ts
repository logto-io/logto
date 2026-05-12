import { UserScope } from '@logto/core-kit';
import { ConnectorType } from '@logto/schemas';

import {
  mockEmailConnectorId,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { getUserIdentity } from '#src/api/admin-user.js';
import { updateConnectorConfig } from '#src/api/connector.js';
import { getUserInfo, replaceIdentity, updateIdentities } from '#src/api/my-account.js';
import {
  createSocialVerificationRecord,
  createVerificationRecordByPassword,
  verifySocialAuthorization,
} from '#src/api/verification-record.js';
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

import {
  socialVerificationAuthorizationCode,
  socialVerificationRedirectUri,
  socialVerificationState,
} from './social-test-utils.js';

describe('my-account (social replace identity)', () => {
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

    await updateConnectorConfig(socialConnectorId, {
      enableTokenStorage: true,
    });
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
  });

  describe('PUT /my-account/identities', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);
      const verificationRecordId = await createVerificationRecordByPassword(api, password);

      await expectRejects(
        replaceIdentity(api, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'auth.unauthorized',
          status: 401,
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
        replaceIdentity(api, 'invalid-verification-record-id', 'new-verification-record-id'),
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
        replaceIdentity(api, verificationRecordId, 'new-verification-record-id'),
        {
          code: 'verification_record.not_found',
          status: 400,
        }
      );

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to replace an existing social identity', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // First, link a social identity via POST
      const { verificationRecordId: firstSocialVerificationId } =
        await createSocialVerificationRecord(
          api,
          connectorIdMap.get(mockSocialConnectorId)!,
          socialVerificationState,
          socialVerificationRedirectUri
        );

      await verifySocialAuthorization(api, firstSocialVerificationId, {
        code: socialVerificationAuthorizationCode,
      });

      const passwordVerificationId = await createVerificationRecordByPassword(api, password);
      await updateIdentities(api, passwordVerificationId, firstSocialVerificationId);

      const userInfo = await getUserInfo(api);
      expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);
      const firstUserId = userInfo.identities?.[mockSocialConnectorTarget]?.userId;

      // Create a different social verification record and replace via PUT
      const { verificationRecordId: secondSocialVerificationId } =
        await createSocialVerificationRecord(
          api,
          connectorIdMap.get(mockSocialConnectorId)!,
          socialVerificationState,
          socialVerificationRedirectUri
        );

      await verifySocialAuthorization(api, secondSocialVerificationId, {
        code: socialVerificationAuthorizationCode,
        userId: 'different-social-user-id',
      });

      const replacePasswordVerificationId = await createVerificationRecordByPassword(api, password);
      await replaceIdentity(api, replacePasswordVerificationId, secondSocialVerificationId);

      const updatedUserInfo = await getUserInfo(api);
      expect(updatedUserInfo.identities).toHaveProperty(mockSocialConnectorTarget);
      expect(updatedUserInfo.identities?.[mockSocialConnectorTarget]?.userId).toBe(
        'different-social-user-id'
      );
      expect(updatedUserInfo.identities?.[mockSocialConnectorTarget]?.userId).not.toBe(firstUserId);

      await deleteDefaultTenantUser(user.id);
    });

    it('should remove stored tokens for the old identity after replacing it', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const firstTokenResponse = {
        access_token: 'first_access_token',
        expires_in: 3600,
        scope: 'profile',
      };

      const { verificationRecordId: firstSocialVerificationId } =
        await createSocialVerificationRecord(
          api,
          connectorIdMap.get(mockSocialConnectorId)!,
          socialVerificationState,
          socialVerificationRedirectUri,
          firstTokenResponse.scope
        );

      await verifySocialAuthorization(api, firstSocialVerificationId, {
        code: socialVerificationAuthorizationCode,
        userId: 'first-social-user-id',
        tokenResponse: firstTokenResponse,
      });

      const passwordVerificationId = await createVerificationRecordByPassword(api, password);
      await updateIdentities(api, passwordVerificationId, firstSocialVerificationId);

      const { tokenSecret } = await getUserIdentity(user.id, mockSocialConnectorTarget);
      expect(tokenSecret?.identityId).toBe('first-social-user-id');
      expect(tokenSecret?.metadata.scope).toBe(firstTokenResponse.scope);

      const { verificationRecordId: secondSocialVerificationId } =
        await createSocialVerificationRecord(
          api,
          connectorIdMap.get(mockSocialConnectorId)!,
          socialVerificationState,
          socialVerificationRedirectUri
        );

      await verifySocialAuthorization(api, secondSocialVerificationId, {
        code: socialVerificationAuthorizationCode,
        userId: 'second-social-user-id',
      });

      const replacePasswordVerificationId = await createVerificationRecordByPassword(api, password);
      await replaceIdentity(api, replacePasswordVerificationId, secondSocialVerificationId);

      const updatedUserInfo = await getUserInfo(api);
      expect(updatedUserInfo.identities?.[mockSocialConnectorTarget]?.userId).toBe(
        'second-social-user-id'
      );

      const { tokenSecret: updatedTokenSecret } = await getUserIdentity(
        user.id,
        mockSocialConnectorTarget
      );
      expect(updatedTokenSecret).toBeUndefined();

      await deleteDefaultTenantUser(user.id);
    });

    it('should be able to upsert a social identity when none exists', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });

      // Use PUT without any existing identity (upsert)
      const { verificationRecordId: newSocialVerificationId } =
        await createSocialVerificationRecord(
          api,
          connectorIdMap.get(mockSocialConnectorId)!,
          socialVerificationState,
          socialVerificationRedirectUri
        );

      await verifySocialAuthorization(api, newSocialVerificationId, {
        code: socialVerificationAuthorizationCode,
      });

      const passwordVerificationId = await createVerificationRecordByPassword(api, password);
      await replaceIdentity(api, passwordVerificationId, newSocialVerificationId);

      const userInfo = await getUserInfo(api);
      expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

      await deleteDefaultTenantUser(user.id);
    });
  });
});
