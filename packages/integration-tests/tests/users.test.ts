import { User } from '@logto/schemas';

import { authedAdminApi } from '@/api';
import { generatePassword, generateUsername } from '@/utils';

const createUser = async (username?: string) => {
  const useUsername = username ?? generateUsername();

  return authedAdminApi
    .post('users', {
      json: {
        username: useUsername,
        password: generatePassword(),
        name: useUsername,
      },
    })
    .json<User>();
};

describe('admin console user management', () => {
  it('should create user successfully', async () => {
    const username = generateUsername();
    const user = await createUser(username);

    const userDetails = await authedAdminApi.get(`users/${user.id}`).json<User>();

    expect(userDetails).toBeTruthy();
    expect(userDetails.username).toBe(username);
  });

  it('should get user list successfully', async () => {
    await createUser();
    const users = await authedAdminApi.get('users').json<User[]>();

    expect(users.length).not.toBeLessThan(1);
  });

  it('should update userinfo successfully', async () => {
    const user = await createUser();

    const newUserData: Partial<User> = {
      name: 'new name',
      avatar: 'https://new.avatar.com/avatar.png',
      customData: {
        level: 1,
      },
      roleNames: ['admin'],
    };

    const updatedUser = await authedAdminApi
      .patch(`users/${user.id}`, {
        json: newUserData,
      })
      .json<User>();

    expect(updatedUser).toMatchObject(newUserData);
  });

  it('should delete user successfully', async () => {
    const user = await createUser();

    const fetchedResponseBeforeDeletion = await authedAdminApi.get(`users/${user.id}`, {
      throwHttpErrors: false,
    });

    expect(fetchedResponseBeforeDeletion.statusCode).toBe(200);

    await authedAdminApi.delete(`users/${user.id}`);

    const fetchedResponseAfterDeletion = await authedAdminApi.get(`users/${user.id}`, {
      throwHttpErrors: false,
    });

    expect(fetchedResponseAfterDeletion.statusCode).toBe(404);
  });

  it('should update user password successfully', async () => {
    const user = await createUser();
    const updatePasswordResponse = await authedAdminApi.patch(`users/${user.id}/password`, {
      json: {
        password: 'newPassword',
      },
      throwHttpErrors: false,
    });

    expect(updatePasswordResponse.statusCode).toBe(200);
  });
});
