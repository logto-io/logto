import type { User, CreateUser } from '@logto/schemas';
import { Users, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { buildIdGenerator } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import { argon2Verify } from 'hash-wasm';
import pRetry from 'p-retry';

import { buildInsertInto } from '#src/database/insert-into.js';
import envSet from '#src/env-set/index.js';
import { findRolesByRoleNames, insertRoles } from '#src/queries/roles.js';
import { hasUserWithId } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';
import { encryptPassword } from '#src/utils/password.js';

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

export const verifyUserPassword = async (user: Nullable<User>, password: string): Promise<User> => {
  assertThat(user, 'session.invalid_credentials');
  const { passwordEncrypted, passwordEncryptionMethod } = user;

  assertThat(passwordEncrypted && passwordEncryptionMethod, 'session.invalid_credentials');

  const result = await argon2Verify({ password, hash: passwordEncrypted });

  assertThat(result, 'session.invalid_credentials');

  return user;
};

const insertUserQuery = buildInsertInto<CreateUser, User>(Users, {
  returning: true,
});

// Temp solution since Hasura requires a role to proceed authn.
// The source of default roles should be guarded and moved to database once we implement RBAC.
export const insertUser: typeof insertUserQuery = async ({ roleNames, ...rest }) => {
  const computedRoleNames = [
    ...new Set((roleNames ?? []).concat(envSet.values.userDefaultRoleNames)),
  ];

  if (computedRoleNames.length > 0) {
    const existingRoles = await findRolesByRoleNames(computedRoleNames);
    const missingRoleNames = computedRoleNames.filter(
      (roleName) => !existingRoles.some(({ name }) => roleName === name)
    );

    if (missingRoleNames.length > 0) {
      await insertRoles(
        missingRoleNames.map((name) => ({ name, description: 'User default role.' }))
      );
    }
  }

  return insertUserQuery({ roleNames: computedRoleNames, ...rest });
};
