import type { BindMfa, CreateUser, Scope, User } from '@logto/schemas';
import {
  adminTenantId,
  ProductEvent,
  RoleType,
  UsersPasswordEncryptionMethod,
} from '@logto/schemas';
import { generateStandardShortId, generateStandardId } from '@logto/shared';
import type { Nullable } from '@silverhand/essentials';
import { deduplicateByKey, condArray } from '@silverhand/essentials';
import { argon2Verify, bcryptVerify, md5, sha1, sha256 } from 'hash-wasm';
import pRetry from 'p-retry';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type JitOrganization } from '#src/queries/organization/email-domains.js';
import { createUsersRolesQueries } from '#src/queries/users-roles.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { legacyVerify } from '#src/utils/password.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';

import { captureDeveloperEvent } from '../utils/posthog.js';

import { convertBindMfaToMfaVerification, encryptUserPassword } from './user.utils.js';

export type InsertUserResult = [User];

export type UserLibrary = ReturnType<typeof createUserLibrary>;

export const createUserLibrary = (tenantId: string, queries: Queries) => {
  const {
    pool,
    roles: { findDefaultRoles, findRolesByRoleNames, findRoleByRoleName, findRolesByRoleIds },
    users: {
      hasUser,
      hasUserWithEmail,
      hasUserWithId,
      hasUserWithNormalizedPhone,
      hasUserWithIdentity,
      findUsersByIds,
      updateUserById,
      insertUser: insertUserQuery,
      findUserById,
    },
    usersRoles: { findUsersRolesByRoleId, findUsersRolesByUserId },
    rolesScopes: { findRolesScopesByRoleIds },
    scopes: { findScopesByIdsAndResourceIndicator },
    organizations,
    oidcModelInstances: { revokeInstanceByUserId },
    userSsoIdentities,
    oidcSessionExtensions,
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

  type InsertUserOptions = {
    /** Additional role names to assign to the user upon creation. */
    roleNames?: string[];
    /**
     * Whether the user is created via an interactive flow (e.g. sign up).
     * @default false
     */
    isInteractive?: boolean;
  };

  const insertUser = async (
    data: OmitAutoSetFields<CreateUser>,
    options?: InsertUserOptions
  ): Promise<InsertUserResult> => {
    const { isInteractive = false } = options ?? {};
    const roleNames = [...EnvSet.values.userDefaultRoleNames, ...(options?.roleNames ?? [])];
    const [parameterRoles, defaultRoles] = await Promise.all([
      findRolesByRoleNames(roleNames),
      findDefaultRoles(RoleType.User),
    ]);

    assertThat(parameterRoles.length === roleNames.length, 'role.default_role_missing');

    const result = await pool.transaction<[User]>(async (connection) => {
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

    if (tenantId === adminTenantId) {
      captureDeveloperEvent(result[0].id, ProductEvent.DeveloperCreated, { isInteractive });
    }

    return result;
  };

  const checkIdentifierCollision = async (
    identifiers: {
      username?: Nullable<string>;
      primaryEmail?: Nullable<string>;
      primaryPhone?: Nullable<string>;
      identity?: Nullable<{ target: string; id: string }>;
    },
    excludeUserId?: string
  ) => {
    const { primaryEmail, primaryPhone, username, identity } = identifiers;

    if (primaryEmail && (await hasUserWithEmail(primaryEmail, excludeUserId))) {
      throw new RequestError({ code: 'user.email_already_in_use', status: 422 });
    }

    if (primaryPhone && (await hasUserWithNormalizedPhone(primaryPhone, excludeUserId))) {
      throw new RequestError({ code: 'user.phone_already_in_use', status: 422 });
    }

    if (username && (await hasUser(username, excludeUserId))) {
      throw new RequestError({ code: 'user.username_already_in_use', status: 422 });
    }

    if (identity && (await hasUserWithIdentity(identity.target, identity.id, excludeUserId))) {
      throw new RequestError({ code: 'user.identity_already_in_use', status: 422 });
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
      // Argon2i, Argon2id, Argon2d shares the same verify function
      case UsersPasswordEncryptionMethod.Argon2i:
      case UsersPasswordEncryptionMethod.Argon2id:
      case UsersPasswordEncryptionMethod.Argon2d: {
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
      case UsersPasswordEncryptionMethod.Legacy: {
        const isValid = await legacyVerify(passwordEncrypted, password);
        assertThat(isValid, new RequestError({ code: 'session.invalid_credentials', status: 422 }));
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
      oidcSessionExtensions.deleteByAccountId(userId),
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
        organizationIds?: undefined;
      }
    | {
        /** The user ID to provision organizations for. */
        userId: string;
        /** The user's email to determine JIT organizations. */
        email?: undefined;
        /** The SSO connector ID to determine JIT organizations. */
        ssoConnectorId: string;
        organizationIds?: undefined;
      }
    | {
        userId: string;
        email?: undefined;
        ssoConnectorId?: undefined;
        organizationIds: string[];
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
    organizationIds,
  }: ProvisionOrganizationsParams): Promise<readonly JitOrganization[]> => {
    const userEmailDomain = email?.split('@')[1];
    const jitOrganizations = condArray(
      userEmailDomain &&
        (await organizations.jit.emailDomains.getJitOrganizations(userEmailDomain)),
      ssoConnectorId && (await organizations.jit.ssoConnectors.getJitOrganizations(ssoConnectorId)),
      organizationIds && (await organizations.jit.getJitOrganizationsByIds(organizationIds))
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
