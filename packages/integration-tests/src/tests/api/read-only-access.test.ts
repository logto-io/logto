import { ApplicationType, readOnlyAccessHeader } from '@logto/schemas';

import {
  createPersonalAccessToken,
  deleteUser,
  type UserProfileResponseWithPasswordHash,
} from '#src/api/admin-user.js';
import { authedAdminApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { createOneTimeToken, deleteOneTimeTokenById } from '#src/api/one-time-token.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { generateEmail, generateName, generatePassword } from '#src/utils.js';

const readOnlyApi = authedAdminApi.extend({ headers: { [readOnlyAccessHeader]: 'true' } });
const readOnlyAccessError = { code: 'auth.read_only_access', status: 403 };

const [application, user, oneTimeToken] = await Promise.all([
  createApplication(generateName(), ApplicationType.Traditional),
  createUserByAdmin({ password: generatePassword() }),
  createOneTimeToken({ email: generateEmail() }),
]);
await createPersonalAccessToken({ userId: user.id, name: generateName() });

describe('read-only Management API access', () => {
  afterAll(async () => {
    await Promise.all([
      deleteApplication(application.id),
      deleteUser(user.id),
      deleteOneTimeTokenById(oneTimeToken.id),
    ]);
  });

  it('reads data that is not a credential', async () => {
    await expect(readOnlyApi.get(`applications/${application.id}`).json()).resolves.toMatchObject({
      id: application.id,
    });
  });

  it.each([
    `applications/${application.id}/secrets`,
    `users/${user.id}/personal-access-tokens`,
    'one-time-tokens',
    `one-time-tokens/${oneTimeToken.id}`,
  ])('refuses to read %s', async (path) => {
    await expectRejects(readOnlyApi.get(path), readOnlyAccessError);
  });

  it('refuses a write', async () => {
    await expectRejects(
      readOnlyApi.post('applications', {
        json: { name: generateName(), type: ApplicationType.Traditional },
      }),
      readOnlyAccessError
    );
  });

  it('returns no password hash', async () => {
    const searchParams = { includePasswordHash: 'true' };
    const foundUser = await readOnlyApi
      .get(`users/${user.id}`, { searchParams })
      .json<UserProfileResponseWithPasswordHash>();
    const foundUsers = await readOnlyApi
      .get('users', { searchParams: { ...searchParams, 'search.id': user.id, 'mode.id': 'exact' } })
      .json<UserProfileResponseWithPasswordHash[]>();

    expect(foundUser).not.toHaveProperty('passwordDigest');
    expect(foundUsers).toHaveLength(1);
    expect(foundUsers[0]).not.toHaveProperty('passwordDigest');
  });
});
