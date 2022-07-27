import { HTTPError } from 'got';

import { createUser } from '@/actions';
import { getUser, getUsers, updateUser, deleteUser, updateUserPassword } from '@/api';

describe('admin console user management', () => {
  it('should create user successfully', async () => {
    const user = await createUser();

    const userDetails = await getUser(user.id);
    expect(userDetails.id).toBe(user.id);
  });

  it('should get user list successfully', async () => {
    await createUser();
    const users = await getUsers();

    expect(users.length).not.toBeLessThan(1);
  });

  it('should update userinfo successfully', async () => {
    const user = await createUser();

    const newUserData = {
      name: 'new name',
      avatar: 'https://new.avatar.com/avatar.png',
      customData: {
        level: 1,
      },
      roleNames: ['admin'],
    };

    const updatedUser = await updateUser(user.id, newUserData);

    expect(updatedUser).toMatchObject(newUserData);
  });

  it('should delete user successfully', async () => {
    const user = await createUser();

    const userEntity = await getUser(user.id);
    expect(userEntity).toMatchObject(user);

    await deleteUser(user.id);

    const response = await getUser(user.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });

  it('should update user password successfully', async () => {
    const user = await createUser();
    const userEntity = await updateUserPassword(user.id, 'new_password');
    expect(userEntity).toMatchObject(user);
  });
});
