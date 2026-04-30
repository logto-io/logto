import { ReservedScope } from '@logto/core-kit';
import { AccountCenterControlValue, ApplicationType, GrantType } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { enableAllAccountCenterFields, updateAccountCenter } from '#src/api/account-center.js';
import { createUser, deleteUser } from '#src/api/admin-user.js';
import { baseApi, oidcApi } from '#src/api/api.js';
import {
  createApplication,
  deleteApplication,
  getApplicationSecrets,
} from '#src/api/application.js';
import { updatePassword } from '#src/api/my-account.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import { expectRejects } from '#src/helpers/index.js';
import { initClientAndSignInForDefaultTenant } from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generateName, generatePassword, generateUsername } from '#src/utils.js';

const impersonationTokenType = 'urn:logto:token-type:impersonation_token';

/* eslint-disable @silverhand/fp/no-let */
let testApplicationId: string;
let authorizationHeader: string;
/* eslint-enable @silverhand/fp/no-let */

const createAccountApi = async (userId: string) => {
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
        scope: ReservedScope.OpenId,
      }),
    })
    .json<{ access_token: string }>();

  return baseApi.extend({
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

const createAccountApiUser = async ({
  password,
  primaryEmail,
}: {
  password?: string;
  primaryEmail?: string;
} = {}) => {
  const username = generateUsername();
  const user = await createUser({ username, password, primaryEmail });
  const api = await createAccountApi(user.id);

  return { api, user, username };
};

describe('account initial password setup', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();

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
    await deleteApplication(testApplicationId);
  });

  it('should fail if verification record is missing for a user with an existing password', async () => {
    const { api, user } = await createAccountApiUser({ password: generatePassword() });

    try {
      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'verification_record.permission_denied',
        status: 401,
      });
    } finally {
      await deleteUser(user.id);
    }
  });

  it('should be able to set initial password without verification when no security verification method is available', async () => {
    const { api, user, username } = await createAccountApiUser();
    const newPassword = generatePassword();

    try {
      await updatePassword(api, undefined, newPassword);

      await initClientAndSignInForDefaultTenant(username, newPassword);
    } finally {
      await deleteUser(user.id);
    }
  });

  it('should reject weak initial password without verification', async () => {
    const { api, user } = await createAccountApiUser();

    try {
      await expectRejects(updatePassword(api, undefined, '123456'), {
        code: 'password.rejected',
        status: 422,
      });
    } finally {
      await deleteUser(user.id);
    }
  });

  it('should fail initial password setup if the password field is not editable', async () => {
    const { api, user } = await createAccountApiUser();

    try {
      await updateAccountCenter({
        fields: {
          password: AccountCenterControlValue.ReadOnly,
        },
      });

      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'account_center.field_not_editable',
        status: 400,
      });
    } finally {
      await Promise.all([enableAllAccountCenterFields(), deleteUser(user.id)]);
    }
  });

  it('should require verification for a user with primary email but no password', async () => {
    const { api, user } = await createAccountApiUser({ primaryEmail: generateEmail() });

    try {
      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'verification_record.permission_denied',
        status: 401,
      });
    } finally {
      await deleteUser(user.id);
    }
  });
});
