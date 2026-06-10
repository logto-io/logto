import { defaultUsernamePolicy } from '@logto/core-kit';
import { type User } from '@logto/schemas';

import { authedAdminApi, deleteUser, updateSignInExperience, updateUser } from '#src/api/index.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { generateUsername } from '#src/utils.js';

const getUsers = async <T>(
  init: string[][] | Record<string, string> | URLSearchParams
): Promise<{ headers: Headers; json: T }> => {
  const response = await authedAdminApi.get('users', {
    searchParams: new URLSearchParams(init),
  });

  return { headers: response.headers, json: (await response.json()) as T };
};

describe('admin console user management (username case sensitive)', () => {
  const username = generateUsername();

  it('should handle usernames case-sensitively', async () => {
    const user = await createUserByAdmin({ username: username.toLowerCase() });
    const user2 = await createUserByAdmin({ username: username.toUpperCase() });
    await expectRejects(createUserByAdmin({ username: username.toUpperCase() }), {
      code: 'user.username_already_in_use',
      status: 422,
    });
    await deleteUser(user.id);
    await deleteUser(user2.id);
  });

  it('should be able to search by case-insensitively', async () => {
    const user = await createUserByAdmin({ username: username.toLowerCase() });
    const user2 = await createUserByAdmin({ username: username.toUpperCase() });
    const { json } = await getUsers<User[]>([['search', `%${username.toLowerCase()}%`]]);
    expect(json[0]).toHaveProperty('username', username.toUpperCase());
    expect(json[1]).toHaveProperty('username', username.toLowerCase());
    await deleteUser(user.id);
    await deleteUser(user2.id);
  });

  it('should allow updating a username that differs only by case', async () => {
    const base = generateUsername();
    const user = await createUserByAdmin({ username: base.toLowerCase() });
    const user2 = await createUserByAdmin();
    const updated = await updateUser(user2.id, { username: base.toUpperCase() });
    expect(updated).toHaveProperty('username', base.toUpperCase());
    await deleteUser(user.id);
    await deleteUser(user2.id);
  });
});

describe('admin console user management (configurable username case sensitivity)', () => {
  const username = generateUsername();

  afterAll(async () => {
    await updateSignInExperience({ usernamePolicy: defaultUsernamePolicy });
  });

  it('should keep usernames case-sensitive when the policy enables it', async () => {
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: true },
    });
    const user = await createUserByAdmin({ username: username.toLowerCase() });
    const user2 = await createUserByAdmin({ username: username.toUpperCase() });
    await deleteUser(user.id);
    await deleteUser(user2.id);
  });

  it('should reject a username that differs only by case when the policy is case-insensitive', async () => {
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: false },
    });
    const user = await createUserByAdmin({ username: username.toLowerCase() });
    await expectRejects(createUserByAdmin({ username: username.toUpperCase() }), {
      code: 'user.username_already_in_use',
      status: 422,
    });
    await deleteUser(user.id);
  });

  it('should reject updating a username to differ only by case when case-insensitive', async () => {
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, caseSensitive: false },
    });
    const base = generateUsername();
    const user = await createUserByAdmin({ username: base.toLowerCase() });
    const user2 = await createUserByAdmin();
    await expectRejects(updateUser(user2.id, { username: base.toUpperCase() }), {
      code: 'user.username_already_in_use',
      status: 422,
    });
    await deleteUser(user.id);
    await deleteUser(user2.id);
  });

  it('should bypass the policy length limits when creating a user via the admin API', async () => {
    // Admin writes are hard-floor-only by design: a username shorter than the policy minimum is
    // accepted here, while end-user write paths reject it.
    await updateSignInExperience({
      usernamePolicy: { ...defaultUsernamePolicy, minLength: 64 },
    });
    const user = await createUserByAdmin({ username: generateUsername() });
    await deleteUser(user.id);
  });
});
