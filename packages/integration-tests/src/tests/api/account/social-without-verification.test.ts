import { ReservedScope, UserScope } from '@logto/core-kit';
import { ApplicationType, ConnectorType, GrantType } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { mockSocialConnectorTarget } from '#src/__mocks__/connectors-mock.js';
import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { createUser, deleteUser } from '#src/api/admin-user.js';
import { baseApi, oidcApi } from '#src/api/api.js';
import {
  createApplication,
  deleteApplication,
  getApplicationSecrets,
} from '#src/api/application.js';
import { getUserInfo, updateIdentities } from '#src/api/my-account.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import { updateConnectorConfig } from '#src/api/connector.js';
import {
  createSocialVerificationRecord,
  createVerificationRecordByPassword,
  verifySocialAuthorization,
} from '#src/api/verification-record.js';
import {
  clearConnectorsByTypes,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { generateName, generateUsername } from '#src/utils.js';

import {
  socialVerificationAuthorizationCode,
  socialVerificationRedirectUri,
  socialVerificationState,
} from './social-test-utils.js';

const impersonationTokenType = 'urn:logto:token-type:impersonation_token';

/* eslint-disable @silverhand/fp/no-let */
let testApplicationId: string;
let authorizationHeader: string;
let socialConnectorId: string;
/* eslint-enable @silverhand/fp/no-let */

const createAccountApi = async (userId: string, scopes = [UserScope.Profile, UserScope.Identities]) => {
  const { subjectToken } = await createSubjectToken(userId);
  const { access_token } = await oidcApi
    .post('token', {
      headers: {
        ...formUrlEncodedHeaders,
        Authorization: authorizationHeader,
      },
      body: new URLSearchParams({
        grant_type: GrantType.TokenExchange,
        subject_token: subjectToken,
        subject_token_type: impersonationTokenType,
        scope: [ReservedScope.OpenId, ...scopes].join(' '),
      }),
    })
    .json<{ access_token: string }>();

  return baseApi.extend({
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

const linkSocialIdentityWithoutIdentityVerification = async (
  api: Awaited<ReturnType<typeof createAccountApi>>
) => {
  const { verificationRecordId: newVerificationRecordId } = await createSocialVerificationRecord(
    api,
    socialConnectorId,
    socialVerificationState,
    socialVerificationRedirectUri
  );

  await verifySocialAuthorization(api, newVerificationRecordId, {
    code: socialVerificationAuthorizationCode,
    tokenResponse: {
      access_token: 'access_token',
      expires_in: 3600,
      scope: 'profile',
    },
  });

  await updateIdentities(api, undefined, newVerificationRecordId);
};

describe('my-account social identities without identity verification', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();

    await clearConnectorsByTypes([ConnectorType.Social]);
    ({ id: socialConnectorId } = await setSocialConnector());
    await updateConnectorConfig(socialConnectorId, {
      enableTokenStorage: true,
    });

    const application = await createApplication(generateName(), ApplicationType.Traditional, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
      customClientMetadata: { allowTokenExchange: true },
    });
    const [secret] = await getApplicationSecrets(application.id);

    /* eslint-disable @silverhand/fp/no-mutation */
    testApplicationId = application.id;
    authorizationHeader = `Basic ${Buffer.from(`${application.id}:${secret!.value}`).toString(
      'base64'
    )}`;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
    await deleteApplication(testApplicationId);
  });

  it('should link social identity without identity verification when no security verification method exists', async () => {
    const user = await createUser({ username: generateUsername() });
    const api = await createAccountApi(user.id);

    try {
      await linkSocialIdentityWithoutIdentityVerification(api);
      const userInfo = await getUserInfo(api);
      expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);
    } finally {
      await deleteUser(user.id);
    }
  });

  it('should require identity verification when password is available', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.Identities],
    });

    const { verificationRecordId: newVerificationRecordId } = await createSocialVerificationRecord(
      api,
      socialConnectorId,
      socialVerificationState,
      socialVerificationRedirectUri
    );

    await verifySocialAuthorization(api, newVerificationRecordId, {
      code: socialVerificationAuthorizationCode,
      tokenResponse: {
        access_token: 'access_token',
        expires_in: 3600,
        scope: 'profile',
      },
    });

    try {
      await expectRejects(updateIdentities(api, undefined, newVerificationRecordId), {
        code: 'verification_record.permission_denied',
        status: 401,
      });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });

  it('should still link social identity when identity verification is provided', async () => {
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.Identities],
    });

    try {
      const { verificationRecordId: newVerificationRecordId } = await createSocialVerificationRecord(
        api,
        socialConnectorId,
        socialVerificationState,
        socialVerificationRedirectUri
      );

      await verifySocialAuthorization(api, newVerificationRecordId, {
        code: socialVerificationAuthorizationCode,
        tokenResponse: {
          access_token: 'access_token',
          expires_in: 3600,
          scope: 'profile',
        },
      });

      const verificationRecordId = await createVerificationRecordByPassword(api, password);
      await updateIdentities(api, verificationRecordId, newVerificationRecordId);
      const userInfo = await getUserInfo(api);
      expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });
});
