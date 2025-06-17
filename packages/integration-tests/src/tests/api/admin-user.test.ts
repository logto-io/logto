import { UsersPasswordEncryptionMethod, ConnectorType } from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  getUser,
  updateUser,
  deleteUser,
  updateUserPassword,
  verifyUserPassword,
  updateUserProfile,
} from '#src/api/index.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { signInWithPassword } from '#src/helpers/interactions.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  generateUsername,
  generateEmail,
  generatePhone,
  generatePassword,
  generateNationalPhoneNumber,
} from '#src/utils.js';

describe('admin console user management', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
  });

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

  it('should create user with password digest successfully', async () => {
    const user = await createUserByAdmin({
      passwordDigest: '5f4dcc3b5aa765d61d8327deb882cf99',
      passwordAlgorithm: UsersPasswordEncryptionMethod.MD5,
    });

    await expect(verifyUserPassword(user.id, 'password')).resolves.not.toThrow();
  });

  it('should create user with custom data and profile successfully', async () => {
    const user = await createUserByAdmin({
      customData: { foo: 'bar' },
      profile: { gender: 'neutral' },
    });
    const { customData, profile } = await getUser(user.id);
    expect({ ...customData }).toStrictEqual({ foo: 'bar' });
    expect({ ...profile }).toStrictEqual({ gender: 'neutral' });
  });

  it('should fail when create user with conflict identifiers', async () => {
    const [username, password, primaryEmail, primaryPhone] = [
      generateUsername(),
      generatePassword(),
      generateEmail(),
      generatePhone(),
    ];
    await createUserByAdmin({ username, password, primaryEmail, primaryPhone });
    await expectRejects(createUserByAdmin({ username, password }), {
      code: 'user.username_already_in_use',
      status: 422,
    });
    await expectRejects(createUserByAdmin({ primaryEmail }), {
      code: 'user.email_already_in_use',
      status: 422,
    });
    await expectRejects(createUserByAdmin({ primaryPhone }), {
      code: 'user.phone_already_in_use',
      status: 422,
    });
  });

  it('should fail when get user by invalid id', async () => {
    await expectRejects(getUser('invalid-user-id'), {
      code: 'entity.not_found',
      status: 404,
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
      profile: {
        familyName: 'new family name',
        address: {
          formatted: 'new formatted address',
        },
      },
    };

    const updatedUser = await updateUser(user.id, newUserData);

    expect(updatedUser).toMatchObject(newUserData);
    expect(updatedUser.updatedAt).toBeGreaterThan(user.updatedAt);
  });

  it('should able to update profile partially', async () => {
    const user = await createUserByAdmin();
    const profile = {
      familyName: 'new family name',
      address: {
        formatted: 'new formatted address',
      },
    };

    const updatedProfile = await updateUserProfile(user.id, profile);
    expect(updatedProfile).toMatchObject(profile);

    const patchProfile = {
      familyName: 'another name',
      website: 'https://logto.io/',
    };
    const updatedProfile2 = await updateUserProfile(user.id, patchProfile);
    expect(updatedProfile2).toMatchObject({ ...profile, ...patchProfile });
  });

  it('should respond 422 when no update data provided', async () => {
    const user = await createUserByAdmin();
    await expectRejects(updateUser(user.id, {}), {
      code: 'entity.invalid_input',
      status: 422,
    });
  });

  it('should fail when update userinfo with conflict identifiers', async () => {
    const [username, primaryEmail, primaryPhone] = [
      generateUsername(),
      generateEmail(),
      generatePhone(),
    ];
    await createUserByAdmin({ username, primaryEmail, primaryPhone });
    const anotherUser = await createUserByAdmin();

    await expectRejects(updateUser(anotherUser.id, { username }), {
      code: 'user.username_already_in_use',
      status: 422,
    });

    await expectRejects(updateUser(anotherUser.id, { primaryEmail }), {
      code: 'user.email_already_in_use',
      status: 422,
    });

    await expectRejects(updateUser(anotherUser.id, { primaryPhone }), {
      code: 'user.phone_already_in_use',
      status: 422,
    });
  });

  it('should delete user successfully', async () => {
    const username = generateUsername();
    const password = 'password';
    const user = await createUserByAdmin({ username, password });

    const userEntity = await getUser(user.id);
    expect(userEntity).toMatchObject(user);

    await deleteUser(user.id);

    const response = await getUser(user.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);

    await enableAllPasswordSignInMethods();
    // Sign in with deleted user should throw error
    await expect(signInWithPassword({ username, password })).rejects.toThrowError();
  });

  it('should update user password successfully', async () => {
    const { updatedAt, ...rest } = await createUserByAdmin();
    const userEntity = await updateUserPassword(rest.id, 'new_password');
    expect(userEntity).toMatchObject({
      ...rest,
      // Since the password is updated, the hasPassword field will be true.
      hasPassword: true,
    });
    expect(userEntity.updatedAt).toBeGreaterThan(updatedAt);
  });

  it('should return 204 if password is correct', async () => {
    const user = await createUserByAdmin({ password: 'new_password' });
    expect(await verifyUserPassword(user.id, 'new_password')).toHaveProperty('status', 204);
    await deleteUser(user.id);
  });

  it('should return 422 if password is incorrect', async () => {
    const user = await createUserByAdmin({ password: 'new_password' });
    await expectRejects(verifyUserPassword(user.id, 'wrong_password'), {
      code: 'session.invalid_credentials',
      status: 422,
    });
    await deleteUser(user.id);
  });

  it('should return 400 if password is empty', async () => {
    const user = await createUserByAdmin();
    await expectRejects(verifyUserPassword(user.id, ''), {
      code: 'guard.invalid_input',
      status: 400,
    });
  });

  describe('create and update user phone number with normalization', () => {
    const nationalNumber = generateNationalPhoneNumber();
    const countryCode = '61';

    const internationalFormatNumber = `${countryCode}${nationalNumber}`;
    const leadingZeroFormatNumber = `${countryCode}0${nationalNumber}`;

    const testCases: Array<{
      existing: string;
      newCreated: string;
    }> = [
      {
        existing: internationalFormatNumber,
        newCreated: leadingZeroFormatNumber,
      },
      {
        existing: leadingZeroFormatNumber,
        newCreated: internationalFormatNumber,
      },
    ];

    it.each(testCases)(
      'should failed to create user with phone number conflict',
      async ({ existing, newCreated }) => {
        const user = await createUserByAdmin({
          primaryPhone: existing,
        });

        await expectRejects(
          createUserByAdmin({
            primaryPhone: newCreated,
          }),
          {
            code: 'user.phone_already_in_use',
            status: 422,
          }
        );

        await deleteUser(user.id);
      }
    );

    it.each(testCases)(
      'should failed to update user with phone number conflict',
      async ({ existing, newCreated }) => {
        const user = await createUserByAdmin({
          primaryPhone: existing,
        });

        const newUser = await createUserByAdmin({
          username: generateUsername(),
        });

        await expectRejects(
          updateUser(newUser.id, {
            primaryPhone: newCreated,
          }),
          {
            code: 'user.phone_already_in_use',
            status: 422,
          }
        );

        // Should allow update existing user
        await expect(
          updateUser(user.id, {
            primaryPhone: newCreated,
          })
        ).resolves.not.toThrow();

        await Promise.all([deleteUser(user.id), deleteUser(newUser.id)]);
      }
    );
  });
});
