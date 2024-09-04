import { type UserProfileResponse } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { type CreateUserPayload, createUser, deleteUser } from '#src/api/index.js';
import {
  generateUsername,
  generateEmail,
  generatePhone,
  generatePassword,
  generateName,
} from '#src/utils.js';

export type NewUserProfileOptions = {
  username?: true;
  password?: true;
  name?: true;
  primaryEmail?: true;
  primaryPhone?: true;
};

export const generateNewUserProfile = <T extends NewUserProfileOptions>({
  username,
  password,
  name,
  primaryEmail,
  primaryPhone,
}: T) => {
  type UserProfile = {
    [K in keyof T]: T[K] extends true ? string : never;
  };

  // @ts-expect-error - TS can't map the type of userProfile to the UserProfile defined above
  const userProfile: UserProfile = {
    name: generateName(),
    ...(username ? { username: generateUsername() } : {}),
    ...(password ? { password: generatePassword() } : {}),
    ...(name ? { name: generateName() } : {}),
    ...(primaryEmail ? { primaryEmail: generateEmail() } : {}),
    ...(primaryPhone ? { primaryPhone: generatePhone() } : {}),
  };

  return userProfile;
};

export const generateNewUser = async <T extends NewUserProfileOptions>(options: T) => {
  const userProfile = generateNewUserProfile(options);

  const user = await createUser(userProfile);

  return { user, userProfile };
};

export class UserApiTest {
  #users: UserProfileResponse[] = [];

  get users(): UserProfileResponse[] {
    return this.#users;
  }

  async create(data: CreateUserPayload): Promise<UserProfileResponse> {
    const user = await createUser(data);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.users.push(user);
    return user;
  }

  /**
   * Delete all created users. This method will ignore errors when deleting users to avoid error
   * when they are deleted by other tests.
   */
  async cleanUp(): Promise<void> {
    // Use `trySafe` to avoid error when user is deleted by other tests.
    await Promise.all(this.users.map(async (user) => trySafe(deleteUser(user.id))));
    this.#users = [];
  }
}
