import { HTTPError } from 'got';

import {
  mockSocialConnectorConfig,
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import {
  getUser,
  updateUser,
  deleteUser,
  updateUserPassword,
  deleteUserIdentity,
  postConnector,
  deleteConnectorById,
} from '#src/api/index.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { createNewSocialUserWithUsernameAndPassword } from '#src/helpers/interactions.js';
import { generateUsername, generateEmail, generatePhone, generatePassword } from '#src/utils.js';

describe('admin console user management', () => {
  it('should create and get user successfully', async () => {
    const user = await createUserByAdmin();

    const userDetails = await getUser(user.id);
    expect(userDetails.id).toBe(user.id);
  });

  it('should fail when create user with conflict identifiers', async () => {
    const [username, password, email, phone] = [
      generateUsername(),
      generatePassword(),
      generateEmail(),
      generatePhone(),
    ];
    await createUserByAdmin(username, password, email, phone);
    await expect(createUserByAdmin(username, password)).rejects.toMatchObject(
      createResponseWithCode(422)
    );
    await expect(createUserByAdmin(undefined, undefined, email)).rejects.toMatchObject(
      createResponseWithCode(422)
    );
    await expect(createUserByAdmin(undefined, undefined, undefined, phone)).rejects.toMatchObject(
      createResponseWithCode(422)
    );
  });

  it('should fail when get user by invalid id', async () => {
    await expect(getUser('invalid-user-id')).rejects.toMatchObject(createResponseWithCode(404));
  });

  it('should update userinfo successfully', async () => {
    const user = await createUserByAdmin();

    const newUserData = {
      name: 'new name',
      avatar: 'https://new.avatar.com/avatar.png',
      customData: {
        level: 1,
      },
    };

    const updatedUser = await updateUser(user.id, newUserData);

    expect(updatedUser).toMatchObject(newUserData);
  });

  it('should fail when update userinfo with conflict identifiers', async () => {
    const user = await createUserByAdmin();
    const anotherUser = await createUserByAdmin();

    await expect(updateUser(user.id, { username: anotherUser.username })).rejects.toMatchObject(
      createResponseWithCode(422)
    );
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
    const { id } = await postConnector({
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorConfig,
    });

    const createdUserId = await createNewSocialUserWithUsernameAndPassword(id);

    const userInfo = await getUser(createdUserId);
    expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

    await deleteUserIdentity(createdUserId, mockSocialConnectorTarget);

    const updatedUser = await getUser(createdUserId);

    expect(updatedUser.identities).not.toHaveProperty(mockSocialConnectorTarget);

    await deleteConnectorById(id);
  });
});
