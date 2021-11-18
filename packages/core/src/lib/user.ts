import { PasswordEncryptionMethod } from '@logto/schemas';
import { nanoid } from 'nanoid';
import pRetry from 'p-retry';

import { hasUserWithId } from '@/queries/user';
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

export const encryptUserPassword = (
  userId: string,
  password: string
): {
  passwordEncryptionSalt: string;
  passwordEncrypted: string;
  passwordEncryptionMethod: PasswordEncryptionMethod;
} => {
  const passwordEncryptionSalt = nanoid();
  const passwordEncryptionMethod = PasswordEncryptionMethod.SaltAndPepper;
  const passwordEncrypted = encryptPassword(
    userId,
    password,
    passwordEncryptionSalt,
    passwordEncryptionMethod
  );

  return { passwordEncrypted, passwordEncryptionMethod, passwordEncryptionSalt };
};
