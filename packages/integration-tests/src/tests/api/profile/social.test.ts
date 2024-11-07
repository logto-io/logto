import { UserScope } from '@logto/core-kit';
import { ConnectorType } from '@logto/schemas';

import {
  mockEmailConnectorId,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { deleteIdentity, getUserInfo, updateIdentities } from '#src/api/profile.js';
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
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('profile (social)', () => {
  const state = 'fake_state';
  const redirectUri = 'http://localhost:3000/redirect';
  const authorizationCode = 'fake_code';
  const connectorIdMap = new Map<string, string>();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();

    await clearConnectorsByTypes([ConnectorType.Social]);
    const { id: socialConnectorId } = await setSocialConnector();
    const { id: emailConnectorId } = await setEmailConnector();
    connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
    connectorIdMap.set(mockEmailConnectorId, emailConnectorId);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);
  });

  describe('POST /profile/identities', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await expectRejects(
        updateIdentities(api, 'invalid-verification-record-id', 'new-verification-record-id'),
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

        const verificationRecordId = await createVerificationRecordByPassword(api, password);
        await updateIdentities(api, verificationRecordId, newVerificationRecordId);
        const userInfo = await getUserInfo(api);
        expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

        await deleteDefaultTenantUser(user.id);
      });
    });
  });

  describe('DELETE /profile/identities/:target', () => {
    it('should fail if scope is missing', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password);

      await expectRejects(
        deleteIdentity(api, mockSocialConnectorTarget, 'invalid-verification-record-id'),
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
