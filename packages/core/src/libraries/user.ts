import { buildIdGenerator } from '@logto/core-kit';
import type { User, CreateUser } from '@logto/schemas';
import { Users, UsersPasswordEncryptionMethod } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import { deduplicate } from '@silverhand/essentials';
import { argon2Verify } from 'hash-wasm';
import pRetry from 'p-retry';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import envSet from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { encryptPassword } from '#src/utils/password.js';

const userId = buildIdGenerator(12);
const roleId = buildIdGenerator(21);

/** @deprecated Don't use. This is for transition only and will be removed soon. */
export const defaultQueries = new Queries(envSet.pool);

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

export const createUserLibrary = (queries: Queries) => {
  const {
    pool,
    roles: { findRolesByRoleNames, insertRoles, findRoleByRoleName },
    users: { hasUser, hasUserWithEmail, hasUserWithId, hasUserWithPhone },
    usersRoles: { insertUsersRoles },
  } = queries;

  const generateUserId = async (retries = 500) =>
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

  const verifyUserPassword = async (user: Nullable<User>, password: string): Promise<User> => {
    assertThat(user, 'session.invalid_credentials');
    const { passwordEncrypted, passwordEncryptionMethod } = user;

    assertThat(passwordEncrypted && passwordEncryptionMethod, 'session.invalid_credentials');

    const result = await argon2Verify({ password, hash: passwordEncrypted });

    assertThat(result, 'session.invalid_credentials');

    return user;
  };

  const insertUserQuery = buildInsertIntoWithPool(pool)<CreateUser, User>(Users, {
    returning: true,
  });

  // Temp solution since Hasura requires a role to proceed authn.
  // The source of default roles should be guarded and moved to database once we implement RBAC.
  const insertUser = async ({
    roleNames,
    ...rest
  }: OmitAutoSetFields<CreateUser> & { roleNames?: string[] }) => {
    const computedRoleNames = deduplicate(
      (roleNames ?? []).concat(envSet.values.userDefaultRoleNames)
    );

    if (computedRoleNames.length > 0) {
      const existingRoles = await findRolesByRoleNames(computedRoleNames);
      const missingRoleNames = computedRoleNames.filter(
        (roleName) => !existingRoles.some(({ name }) => roleName === name)
      );

      if (missingRoleNames.length > 0) {
        await insertRoles(
          missingRoleNames.map((name) => ({
            id: roleId(),
            name,
            description: 'User default role.',
          }))
        );
      }
    }

    const user = await insertUserQuery(rest);

    await Promise.all([
      computedRoleNames.map(async (roleName) => {
        const role = await findRoleByRoleName(roleName);

        if (!role) {
          // Not expected to happen, just inserted above, so is 500
          throw new Error(`Can not find role: ${roleName}`);
        }

        await insertUsersRoles([{ userId: user.id, roleId: role.id }]);
      }),
    ]);

    return user;
  };

  const checkIdentifierCollision = async (
    identifiers: {
      username?: Nullable<string>;
      primaryEmail?: Nullable<string>;
      primaryPhone?: Nullable<string>;
    },
    excludeUserId?: string
  ) => {
    const { username, primaryEmail, primaryPhone } = identifiers;

    if (username && (await hasUser(username, excludeUserId))) {
      throw new RequestError({ code: 'user.username_already_in_use', status: 422 });
    }

    if (primaryEmail && (await hasUserWithEmail(primaryEmail, excludeUserId))) {
      throw new RequestError({ code: 'user.email_already_in_use', status: 422 });
    }

    if (primaryPhone && (await hasUserWithPhone(primaryPhone, excludeUserId))) {
      throw new RequestError({ code: 'user.phone_already_in_use', status: 422 });
    }
  };

  return {
    generateUserId,
    verifyUserPassword,
    insertUser,
    checkIdentifierCollision,
  };
};

/** @deprecated Don't use. This is for transition only and will be removed soon. */
export const { generateUserId, verifyUserPassword, insertUser, checkIdentifierCollision } =
  createUserLibrary(defaultQueries);
