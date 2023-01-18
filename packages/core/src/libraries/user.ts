import { buildIdGenerator } from '@logto/core-kit';
import type { User, CreateUser, Scope } from '@logto/schemas';
import { Users, UsersPasswordEncryptionMethod, defaultRole } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import { deduplicate } from '@silverhand/essentials';
import { argon2Verify } from 'hash-wasm';
import pRetry from 'p-retry';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { encryptPassword } from '#src/utils/password.js';

const userId = buildIdGenerator(12);
const roleId = buildIdGenerator(21);

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

export type UserLibrary = ReturnType<typeof createUserLibrary>;

export const createUserLibrary = (queries: Queries) => {
  const {
    pool,
    roles: { findRolesByRoleNames, insertRoles, findRoleByRoleName, findRolesByRoleIds },
    users: {
      hasUser,
      hasUserWithEmail,
      hasUserWithId,
      hasUserWithPhone,
      findUsersByIds,
      findUserById,
    },
    usersRoles: { insertUsersRoles, findUsersRolesByRoleId, findUsersRolesByUserId },
    rolesScopes: { findRolesScopesByRoleIds },
    scopes: { findScopesByIdsAndResourceId },
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

  const insertUserQuery = buildInsertIntoWithPool(pool)<CreateUser, User>(Users, {
    returning: true,
  });

  const insertUser = async (data: OmitAutoSetFields<CreateUser>, isAdmin = false) => {
    const roleNames = deduplicate([
      ...EnvSet.values.userDefaultRoleNames,
      ...(isAdmin ? [defaultRole.name] : []),
    ]);
    const roles = await findRolesByRoleNames(roleNames);

    assertThat(roles.length === roleNames.length, 'role.default_role_missing');

    const user = await insertUserQuery(data);

    if (roles.length > 0) {
      await insertUsersRoles(roles.map(({ id }) => ({ userId: user.id, roleId: id })));
    }

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

  const findUsersByRoleName = async (roleName: string) => {
    const role = await findRoleByRoleName(roleName);

    if (!role) {
      return [];
    }

    const usersRoles = await findUsersRolesByRoleId(role.id);

    if (usersRoles.length === 0) {
      return [];
    }

    return findUsersByIds(usersRoles.map(({ userId }) => userId));
  };

  const findUserScopesForResourceId = async (
    userId: string,
    resourceId: string
  ): Promise<readonly Scope[]> => {
    const usersRoles = await findUsersRolesByUserId(userId);
    const rolesScopes = await findRolesScopesByRoleIds(usersRoles.map(({ roleId }) => roleId));
    const scopes = await findScopesByIdsAndResourceId(
      rolesScopes.map(({ scopeId }) => scopeId),
      resourceId
    );

    return scopes;
  };

  const findUserRoles = async (userId: string) => {
    const usersRoles = await findUsersRolesByUserId(userId);
    const roles = await findRolesByRoleIds(usersRoles.map(({ roleId }) => roleId));

    return roles;
  };

  return {
    generateUserId,
    insertUser,
    checkIdentifierCollision,
    findUsersByRoleName,
    findUserScopesForResourceId,
    findUserRoles,
  };
};
