import { User, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { argon2Verify } from 'hash-wasm';
import pRetry from 'p-retry';

import { findUserByUsername, hasUserWithId, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { buildIdGenerator } from '@/utils/id';
import { encryptPassword } from '@/utils/password';

const userId = buildIdGenerator(12);

export const generateUserId = async (retries = 500) =>
  pRetry(
    async () => {
      const id = userId();

      if (!(await hasUserWithId(id))) {
        return id;
      }

      throw new Error('Cannot generate user ID in reasonable retries');
    },
    { retries, factor: 0 } // No need for exponential backoff
  );

export const encryptUserPassword = async (
  password: string
): Promise<{
  passwordEncrypted: string;
  passwordEncryptionMethod: UsersPasswordEncryptionMethod;
}> => {
  const passwordEncryptionMethod = UsersPasswordEncryptionMethod.Argon2i;
  const passwordEncrypted = await encryptPassword(
    password,

    passwordEncryptionMethod
  );

  return { passwordEncrypted, passwordEncryptionMethod };
};

export const findUserByUsernameAndPassword = async (
  username: string,
  password: string
): Promise<User> => {
  const user = await findUserByUsername(username);
  assertThat(user, 'session.invalid_credentials');
  const { passwordEncrypted, passwordEncryptionMethod } = user;

  assertThat(passwordEncrypted && passwordEncryptionMethod, 'session.invalid_sign_in_method');

  const result = await argon2Verify({ password, hash: passwordEncrypted });

  assertThat(result, 'session.invalid_credentials');

  return user;
};

export const updateLastSignInAt = async (userId: string) =>
  updateUserById(userId, { lastSignInAt: Date.now() });
