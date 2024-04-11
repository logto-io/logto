import { type User } from '@logto/schemas';

import { authedAdminApi, deleteUser } from '#src/api/index.js';
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
});
