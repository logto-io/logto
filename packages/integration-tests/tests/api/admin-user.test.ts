import { HTTPError } from 'got';

import {
  mockSocialConnectorConfig,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '@/__mocks__/connectors-mock';
import {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  updateUserPassword,
  deleteUserIdentity,
  listConnectors,
  deleteConnectorById,
  postConnector,
  updateConnectorConfig,
} from '@/api';
import { createUserByAdmin, bindSocialToNewCreatedUser } from '@/helpers';

describe('admin console user management', () => {
  it('should create user successfully', async () => {
    const user = await createUserByAdmin();

    const userDetails = await getUser(user.id);
    expect(userDetails.id).toBe(user.id);
  });

  it('should get user list successfully', async () => {
    await createUserByAdmin();
    const users = await getUsers();

    expect(users.length).not.toBeLessThan(1);
  });

  it('should update userinfo successfully', async () => {
    const user = await createUserByAdmin();

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
    const user = await createUserByAdmin();

    const userEntity = await getUser(user.id);
    expect(userEntity).toMatchObject(user);

    await deleteUser(user.id);

    const response = await getUser(user.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });

  it('should update user password successfully', async () => {
    const user = await createUserByAdmin();
    const userEntity = await updateUserPassword(user.id, 'new_password');
    expect(userEntity).toMatchObject(user);
  });

  it('should delete user identities successfully', async () => {
    const connectors = await listConnectors();
    await Promise.all(
      connectors
        .filter(({ connectorId }) => connectorId.startsWith('mock-'))
        .map(async ({ id }) => {
          await deleteConnectorById(id);
        })
    );
    const { id } = await postConnector(mockSocialConnectorId);
    await updateConnectorConfig(id, mockSocialConnectorConfig);

    const createdUserId = await bindSocialToNewCreatedUser(id);

    const userInfo = await getUser(createdUserId);
    expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

    await deleteUserIdentity(createdUserId, mockSocialConnectorTarget);

    const updatedUser = await getUser(createdUserId);

    expect(updatedUser.identities).not.toHaveProperty(mockSocialConnectorTarget);
  });
});
