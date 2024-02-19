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
  getConnectorAuthorizationUri,
  deleteConnectorById,
  postUserIdentity,
  verifyUserPassword,
  putUserIdentity,
} from '#src/api/index.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { createNewSocialUserWithUsernameAndPassword } from '#src/helpers/interactions.js';
import { generateUsername, generateEmail, generatePhone, generatePassword } from '#src/utils.js';

describe('admin console user management', () => {
  it('should create and get user successfully', async () => {
    const user = await createUserByAdmin();

    // `ssoIdentities` field is undefined if not specified.
    const userDetails = await getUser(user.id);
    expect(userDetails.id).toBe(user.id);
    expect(userDetails.ssoIdentities).toBeUndefined();

    // `ssoIdentities` field should be array type is specified that return user info with `includeSsoIdentities`.
    const userDetailsWithSsoIdentities = await getUser(user.id, true);
    expect(userDetailsWithSsoIdentities.ssoIdentities).toStrictEqual([]);
  });

  it('should fail when create user with conflict identifiers', async () => {
    const [username, password, email, phone] = [
      generateUsername(),
      generatePassword(),
      generateEmail(),
      generatePhone(),
    ];
    await createUserByAdmin(username, password, email, phone);
    await expectRejects(createUserByAdmin(username, password), {
      code: 'user.username_already_in_use',
      statusCode: 422,
    });
    await expectRejects(createUserByAdmin(undefined, undefined, email), {
      code: 'user.email_already_in_use',
      statusCode: 422,
    });
    await expectRejects(createUserByAdmin(undefined, undefined, undefined, phone), {
      code: 'user.phone_already_in_use',
      statusCode: 422,
    });
  });

  it('should fail when get user by invalid id', async () => {
    await expectRejects(getUser('invalid-user-id'), {
      code: 'entity.not_found',
      statusCode: 404,
    });
  });

  it('should update userinfo successfully', async () => {
    const user = await createUserByAdmin();

    const newUserData = {
      name: 'new name',
      primaryEmail: generateEmail(),
      primaryPhone: generatePhone(),
      username: generateUsername(),
      avatar: 'https://new.avatar.com/avatar.png',
      customData: {
        level: 1,
      },
    };

    const updatedUser = await updateUser(user.id, newUserData);

    expect(updatedUser).toMatchObject(newUserData);
  });

  it('should respond 422 when no update data provided', async () => {
    const user = await createUserByAdmin();
    await expectRejects(updateUser(user.id, {}), {
      code: 'entity.invalid_input',
      statusCode: 422,
    });
  });

  it('should fail when update userinfo with conflict identifiers', async () => {
    const [username, email, phone] = [generateUsername(), generateEmail(), generatePhone()];
    await createUserByAdmin(username, undefined, email, phone);
    const anotherUser = await createUserByAdmin();

    await expectRejects(updateUser(anotherUser.id, { username }), {
      code: 'user.username_already_in_use',
      statusCode: 422,
    });

    await expectRejects(updateUser(anotherUser.id, { primaryEmail: email }), {
      code: 'user.email_already_in_use',
      statusCode: 422,
    });

    await expectRejects(updateUser(anotherUser.id, { primaryPhone: phone }), {
      code: 'user.phone_already_in_use',
      statusCode: 422,
    });
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

  it('should link social identity successfully', async () => {
    const { id: connectorId } = await postConnector({
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorConfig,
    });

    const state = 'random_state';
    const redirectUri = 'http://mock.social.com/callback/random_string';
    const code = 'random_code_from_social';
    const socialUserId = 'social_platform_user_id';
    const socialUserEmail = 'johndoe@gmail.com';
    const anotherSocialUserId = 'another_social_platform_user_id';
    const socialTarget = 'social_target';
    const socialIdentity = {
      userId: 'social_identity_user_id',
      details: {
        age: 21,
        email: 'foo@logto.io',
      },
    };

    const { id: userId } = await createUserByAdmin();
    const { redirectTo } = await getConnectorAuthorizationUri(connectorId, state, redirectUri);

    expect(redirectTo).toBe(`http://mock.social.com/?state=${state}&redirect_uri=${redirectUri}`);

    const identities = await postUserIdentity(userId, connectorId, {
      code,
      state,
      redirectUri,
      userId: socialUserId,
      email: socialUserEmail,
    });

    expect(identities).toHaveProperty(mockSocialConnectorTarget);
    expect(identities[mockSocialConnectorTarget]).toMatchObject({
      userId: socialUserId,
      details: {
        id: socialUserId,
        email: socialUserEmail,
      },
    });

    const updatedIdentity = await putUserIdentity(userId, mockSocialConnectorTarget, {
      userId: anotherSocialUserId,
    });
    expect(updatedIdentity).toHaveProperty(mockSocialConnectorTarget);
    expect(updatedIdentity[mockSocialConnectorTarget]).toMatchObject({
      userId: anotherSocialUserId,
    });

    const updatedIdentities = await putUserIdentity(userId, socialTarget, socialIdentity);
    expect(updatedIdentities).toMatchObject({
      [mockSocialConnectorTarget]: {
        userId: anotherSocialUserId,
      },
      [socialTarget]: socialIdentity,
    });

    await deleteConnectorById(connectorId);
  });

  it('should delete user identities successfully', async () => {
    const { id: connectorId } = await postConnector({
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorConfig,
    });

    const createdUserId = await createNewSocialUserWithUsernameAndPassword(connectorId);

    const userInfo = await getUser(createdUserId);
    expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

    await deleteUserIdentity(createdUserId, mockSocialConnectorTarget);

    const updatedUser = await getUser(createdUserId);

    expect(updatedUser.identities).not.toHaveProperty(mockSocialConnectorTarget);

    await deleteConnectorById(connectorId);
  });

  it('should return 204 if password is correct', async () => {
    const user = await createUserByAdmin(undefined, 'new_password');
    expect(await verifyUserPassword(user.id, 'new_password')).toHaveProperty('statusCode', 204);
    await deleteUser(user.id);
  });

  it('should return 422 if password is incorrect', async () => {
    const user = await createUserByAdmin(undefined, 'new_password');
    await expectRejects(verifyUserPassword(user.id, 'wrong_password'), {
      code: 'session.invalid_credentials',
      statusCode: 422,
    });
    await deleteUser(user.id);
  });

  it('should return 400 if password is empty', async () => {
    const user = await createUserByAdmin();
    await expectRejects(verifyUserPassword(user.id, ''), {
      code: 'guard.invalid_input',
      statusCode: 400,
    });
  });
});
