import { UserScope } from '@logto/core-kit';
import { ConnectorType, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import {
  mockEmailConnectorId,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { updateConnectorConfig } from '#src/api/connector.js';
import { deleteIdentity, getUserInfo } from '#src/api/my-account.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
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
  linkSocialIdentity,
  updateOnlyAvailableIdentifierSignInMethod,
} from './social-test-utils.js';

describe('my-account (social delete identity)', () => {
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
      const { verificationRecordId } = await linkSocialIdentity(
        api,
        password,
        connectorIdMap.get(mockSocialConnectorId)!
      );

      const userInfo = await getUserInfo(api);
      expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

      await deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId);

      const updatedUserInfo = await getUserInfo(api);
      expect(updatedUserInfo.identities).not.toHaveProperty(mockSocialConnectorTarget);

      await deleteDefaultTenantUser(user.id);
    });

    it('should reject deleting the last available sign-in method', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { verificationRecordId } = await linkSocialIdentity(
        api,
        password,
        connectorIdMap.get(mockSocialConnectorId)!
      );

      await updateOnlyAvailableIdentifierSignInMethod({
        identifier: SignInIdentifier.Phone,
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
        socialConnectorTarget: mockSocialConnectorTarget,
      });

      await expectRejects(deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId), {
        code: 'user.last_sign_in_method_required',
        status: 400,
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should allow deleting social identity when another identifier sign-in method remains available', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword({
        primaryEmail: `${generateStandardId()}@example.com`,
      });
      const api = await signInAndGetUserApi(username, password, {
        scopes: [UserScope.Profile, UserScope.Identities],
      });
      const { verificationRecordId } = await linkSocialIdentity(
        api,
        password,
        connectorIdMap.get(mockSocialConnectorId)!
      );

      await updateOnlyAvailableIdentifierSignInMethod({
        identifier: SignInIdentifier.Email,
        password: false,
        verificationCode: true,
        isPasswordPrimary: false,
        socialConnectorTarget: mockSocialConnectorTarget,
      });

      await deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId);

      const updatedUserInfo = await getUserInfo(api);
      expect(updatedUserInfo.identities).not.toHaveProperty(mockSocialConnectorTarget);

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });

    it('should localize the last available sign-in method error message', async () => {
      const { user, username, password } = await createDefaultTenantUserWithPassword();
      const api = await signInAndGetUserApi(
        username,
        password,
        {
          scopes: [UserScope.Profile, UserScope.Identities],
        },
        'fr'
      );
      const { verificationRecordId } = await linkSocialIdentity(
        api,
        password,
        connectorIdMap.get(mockSocialConnectorId)!
      );

      await updateOnlyAvailableIdentifierSignInMethod({
        identifier: SignInIdentifier.Phone,
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
        socialConnectorTarget: mockSocialConnectorTarget,
      });

      await expectRejects(deleteIdentity(api, mockSocialConnectorTarget, verificationRecordId), {
        code: 'user.last_sign_in_method_required',
        status: 400,
        messageIncludes: 'au moins une méthode de connexion disponible',
      });

      await enableAllPasswordSignInMethods();
      await deleteDefaultTenantUser(user.id);
    });
  });
});
