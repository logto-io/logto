import type { BindMfa, CreateUser, Scope, User } from '@logto/schemas';
import { RoleType, Users, UsersPasswordEncryptionMethod } from '@logto/schemas';
import { generateStandardId, generateStandardShortId } from '@logto/shared';
import { condArray, deduplicateByKey, type Nullable } from '@silverhand/essentials';
import { argon2Verify, bcryptVerify, md5, sha1, sha256 } from 'hash-wasm';
import pRetry from 'p-retry';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type JitOrganization } from '#src/queries/organization/email-domains.js';
import { createUsersRolesQueries } from '#src/queries/users-roles.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';

import { convertBindMfaToMfaVerification, encryptUserPassword } from './user.utils.js';

export type InsertUserResult = [User];

export type UserLibrary = ReturnType<typeof createUserLibrary>;

export const createUserLibrary = (queries: Queries) => {
  const {
    pool,
    roles: { findDefaultRoles, findRolesByRoleNames, findRoleByRoleName, findRolesByRoleIds },
    users: {
      hasUser,
      hasUserWithEmail,
      hasUserWithId,
      hasUserWithPhone,
      findUsersByIds,
      updateUserById,
      findUserById,
    },
    usersRoles: { findUsersRolesByRoleId, findUsersRolesByUserId },
    rolesScopes: { findRolesScopesByRoleIds },
    scopes: { findScopesByIdsAndResourceIndicator },
    organizations,
    oidcModelInstances: { revokeInstanceByUserId },
    userSsoIdentities,
  } = queries;

  const generateUserId = async (retries = 500) =>
    pRetry(
      async () => {
        const id = generateStandardShortId();

        if (!(await hasUserWithId(id))) {
          return id;
        }

        throw new Error('Cannot generate user ID in reasonable retries');
      },
      { retries, factor: 0 } // No need for exponential backoff
    );

  const insertUser = async (
    data: OmitAutoSetFields<CreateUser>,
    additionalRoleNames: string[]
  ): Promise<InsertUserResult> => {
    const roleNames = [...EnvSet.values.userDefaultRoleNames, ...additionalRoleNames];
    const [parameterRoles, defaultRoles] = await Promise.all([
      findRolesByRoleNames(roleNames),
      findDefaultRoles(RoleType.User),
    ]);

    assertThat(parameterRoles.length === roleNames.length, 'role.default_role_missing');

    return pool.transaction(async (connection) => {
      const insertUserQuery = buildInsertIntoWithPool(connection)(Users, {
        returning: true,
      });

      const user = await insertUserQuery(data);
      const roles = deduplicateByKey([...parameterRoles, ...defaultRoles], 'id');

      if (roles.length > 0) {
        const { insertUsersRoles } = createUsersRolesQueries(connection);
        await insertUsersRoles(
          roles.map(({ id }) => ({ id: generateStandardId(), userId: user.id, roleId: id }))
        );
      }

      return [user];
    });
  };

  const checkIdentifierCollision = async (
    identifiers: {
      username?: Nullable<string>;
      primaryEmail?: Nullable<string>;
      primaryPhone?: Nullable<string>;
    },
    excludeUserId?: string
  ) => {
    const { primaryEmail, primaryPhone, username } = identifiers;

    if (primaryEmail && (await hasUserWithEmail(primaryEmail, excludeUserId))) {
      throw new RequestError({ code: 'user.email_already_in_use', status: 422 });
    }

    if (primaryPhone && (await hasUserWithPhone(primaryPhone, excludeUserId))) {
      throw new RequestError({ code: 'user.phone_already_in_use', status: 422 });
    }

    if (username && (await hasUser(username, excludeUserId))) {
      throw new RequestError({ code: 'user.username_already_in_use', status: 422 });
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

  /**
   * Find user scopes for a resource indicator, from roles and organization roles.
   * Set `organizationId` to narrow down the search to the specific organization, otherwise it will search all organizations.
   */
  const findUserScopesForResourceIndicator = async (
    userId: string,
    resourceIndicator: string,
    findFromOrganizations = false,
    organizationId?: string
  ): Promise<readonly Scope[]> => {
    const usersRoles = await findUsersRolesByUserId(userId);
    const rolesScopes = await findRolesScopesByRoleIds(usersRoles.map(({ roleId }) => roleId));
    const organizationScopes = findFromOrganizations
      ? await organizations.relations.usersRoles.getUserResourceScopes(
          userId,
          resourceIndicator,
          organizationId
        )
      : [];

    const scopes = await findScopesByIdsAndResourceIndicator(
      [...rolesScopes.map(({ scopeId }) => scopeId), ...organizationScopes.map(({ id }) => id)],
      resourceIndicator
    );

    return scopes;
  };

  const findUserRoles = async (userId: string) => {
    const usersRoles = await findUsersRolesByUserId(userId);
    const roles = await findRolesByRoleIds(usersRoles.map(({ roleId }) => roleId));

    return roles;
  };

  const addUserMfaVerification = async (userId: string, payload: BindMfa) => {
    // TODO @sijie use jsonb array append
    const { mfaVerifications } = await findUserById(userId);
    await updateUserById(userId, {
      mfaVerifications: [...mfaVerifications, convertBindMfaToMfaVerification(payload)],
    });
  };

  const verifyUserPassword = async (user: Nullable<User>, password: string): Promise<User> => {
    assertThat(user, new RequestError({ code: 'session.invalid_credentials', status: 422 }));
    const { passwordEncrypted, passwordEncryptionMethod, id } = user;

    assertThat(
      passwordEncrypted && passwordEncryptionMethod,
      new RequestError({ code: 'session.invalid_credentials', status: 422 })
    );

    switch (passwordEncryptionMethod) {
      case UsersPasswordEncryptionMethod.Argon2i: {
        const result = await argon2Verify({ password, hash: passwordEncrypted });
        assertThat(result, new RequestError({ code: 'session.invalid_credentials', status: 422 }));
        break;
      }
      case UsersPasswordEncryptionMethod.MD5: {
        const expectedEncrypted = await md5(password);
        assertThat(
          expectedEncrypted === passwordEncrypted,
          new RequestError({ code: 'session.invalid_credentials', status: 422 })
        );
        break;
      }
      case UsersPasswordEncryptionMethod.SHA1: {
        const expectedEncrypted = await sha1(password);
        assertThat(
          expectedEncrypted === passwordEncrypted,
          new RequestError({ code: 'session.invalid_credentials', status: 422 })
        );
        break;
      }
      case UsersPasswordEncryptionMethod.SHA256: {
        const expectedEncrypted = await sha256(password);
        assertThat(
          expectedEncrypted === passwordEncrypted,
          new RequestError({ code: 'session.invalid_credentials', status: 422 })
        );
        break;
      }
      case UsersPasswordEncryptionMethod.Bcrypt: {
        const result = await bcryptVerify({ password, hash: passwordEncrypted });
        assertThat(result, new RequestError({ code: 'session.invalid_credentials', status: 422 }));
        break;
      }
    }

    // Migrate password to default algorithm: argon2i
    if (passwordEncryptionMethod !== UsersPasswordEncryptionMethod.Argon2i) {
      const { passwordEncrypted: newEncrypted, passwordEncryptionMethod: newMethod } =
        await encryptUserPassword(password);
      return updateUserById(id, {
        passwordEncrypted: newEncrypted,
        passwordEncryptionMethod: newMethod,
      });
    }

    return user;
  };

  const signOutUser = async (userId: string) => {
    await Promise.all([
      revokeInstanceByUserId('AccessToken', userId),
      revokeInstanceByUserId('RefreshToken', userId),
      revokeInstanceByUserId('Session', userId),
    ]);
  };

  /**
   * Expose the findUserSsoIdentitiesByUserId query method for the user library.
   */
  const findUserSsoIdentities = async (userId: string) =>
    userSsoIdentities.findUserSsoIdentitiesByUserId(userId);

  type ProvisionOrganizationsParams =
    | {
        /** The user ID to provision organizations for. */
        userId: string;
        /** The user's email to determine JIT organizations. */
        email: string;
        /** The SSO connector ID to determine JIT organizations. */
        ssoConnectorId?: undefined;
      }
    | {
        /** The user ID to provision organizations for. */
        userId: string;
        /** The user's email to determine JIT organizations. */
        email?: undefined;
        /** The SSO connector ID to determine JIT organizations. */
        ssoConnectorId: string;
      };

  // TODO: If the user's email is not verified, we should not provision the user into any organization.
  /**
   * Provision the user with JIT organizations and roles based on the user's email domain and the
   * enterprise SSO connector.
   */
  const provisionOrganizations = async ({
    userId,
    email,
    ssoConnectorId,
  }: ProvisionOrganizationsParams): Promise<readonly JitOrganization[]> => {
    const userEmailDomain = email?.split('@')[1];
    const jitOrganizations = condArray(
      userEmailDomain &&
        (await organizations.jit.emailDomains.getJitOrganizations(userEmailDomain)),
      ssoConnectorId && (await organizations.jit.ssoConnectors.getJitOrganizations(ssoConnectorId))
    );

    if (jitOrganizations.length === 0) {
      return [];
    }

    await organizations.relations.users.insert(
      ...jitOrganizations.map(({ organizationId }) => ({
        organizationId,
        userId,
      }))
    );

    const data = jitOrganizations.flatMap(({ organizationId, organizationRoleIds }) =>
      organizationRoleIds.map((organizationRoleId) => ({
        organizationId,
        organizationRoleId,
        userId,
      }))
    );
    if (data.length > 0) {
      await organizations.relations.usersRoles.insert(...data);
    }

    return jitOrganizations;
  };

  return {
    generateUserId,
    insertUser,
    checkIdentifierCollision,
    findUsersByRoleName,
    findUserScopesForResourceIndicator,
    findUserRoles,
    addUserMfaVerification,
    verifyUserPassword,
    signOutUser,
    findUserSsoIdentities,
    provisionOrganizations,
  };
};
