import {
  userInfoSelectFields,
  jwtCustomizerUserContextGuard,
  type LogtoJwtTokenKey,
  type JwtCustomizerType,
  type JwtCustomizerUserContext,
} from '@logto/schemas';
import { type ConsoleLog } from '@logto/shared';
import { deduplicate, pick, pickState, assert } from '@silverhand/essentials';
import deepmerge from 'deepmerge';

import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { type ScopeLibrary } from '#src/libraries/scope.js';
import { type UserLibrary } from '#src/libraries/user.js';
import type Queries from '#src/tenants/Queries.js';
import {
  getJwtCustomizerScripts,
  type CustomJwtDeployRequestBody,
} from '#src/utils/custom-jwt/index.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';

export const createJwtCustomizerLibrary = (
  queries: Queries,
  logtoConfigs: LogtoConfigLibrary,
  cloudConnection: CloudConnectionLibrary,
  userLibrary: UserLibrary,
  scopeLibrary: ScopeLibrary
) => {
  const {
    users: { findUserById },
    rolesScopes: { findRolesScopesByRoleIds },
    scopes: { findScopesByIds },
    userSsoIdentities,
    organizations: { relations },
  } = queries;
  const { findUserRoles } = userLibrary;
  const { attachResourceToScopes } = scopeLibrary;
  const { getJwtCustomizers } = logtoConfigs;

  /**
   * We does not include org roles' scopes for the following reason:
   * 1. The org scopes query method requires `limit` and `offset` parameters. Other management API get
   * these APIs from console setup while this library method is a backend used method.
   * 2. Logto developers can get the org roles' id from this user context and hence query the org roles' scopes via management API.
   */
  const getUserContext = async (userId: string): Promise<JwtCustomizerUserContext> => {
    const user = await findUserById(userId);
    const fullSsoIdentities = await userSsoIdentities.findUserSsoIdentitiesByUserId(userId);
    const roles = await findUserRoles(userId);
    const rolesScopes = await findRolesScopesByRoleIds(roles.map(({ id }) => id));
    const scopeIds = rolesScopes.map(({ scopeId }) => scopeId);
    const scopes = await findScopesByIds(scopeIds);
    const scopesWithResources = await attachResourceToScopes(scopes);
    const organizationsWithRoles = await relations.users.getOrganizationsByUserId(userId);
    const userContext = {
      ...pick(user, ...userInfoSelectFields),
      ssoIdentities: fullSsoIdentities.map(pickState('issuer', 'identityId', 'detail')),
      mfaVerificationFactors: deduplicate(user.mfaVerifications.map(({ type }) => type)),
      roles: roles.map((role) => {
        const scopeIds = new Set(
          rolesScopes.filter(({ roleId }) => roleId === role.id).map(({ scopeId }) => scopeId)
        );
        return {
          ...pick(role, 'id', 'name', 'description'),
          scopes: scopesWithResources
            .filter(({ id }) => scopeIds.has(id))
            .map(pickState('id', 'name', 'description', 'resourceId', 'resource')),
        };
      }),
      organizations: organizationsWithRoles.map(pickState('id', 'name', 'description')),
      organizationRoles: organizationsWithRoles.flatMap(
        ({ id: organizationId, organizationRoles }) =>
          organizationRoles.map(({ id: roleId, name: roleName }) => ({
            organizationId,
            roleId,
            roleName,
          }))
      ),
    };

    return jwtCustomizerUserContextGuard.parse(userContext);
  };

  /**
   * This method is used to deploy the give JWT customizer scripts to the cloud worker service.
   *
   * @remarks Since cloud worker service deploy all the JWT customizer scripts at once,
   * and the latest JWT customizer updates needs to be deployed ahead before saving it to the database,
   * we need to merge the input payload with the existing JWT customizer scripts.
   *
   * @params payload - The latest JWT customizer payload needs to be deployed.
   * @params payload.key - The tokenType of the JWT customizer.
   * @params payload.value - JWT customizer value
   * @params payload.useCase - The use case of JWT customizer script, can be either `test` or `production`.
   */
  const deployJwtCustomizerScript = async <T extends LogtoJwtTokenKey>(
    consoleLog: ConsoleLog,
    payload: {
      key: T;
      value: JwtCustomizerType[T];
      useCase: 'test' | 'production';
    }
  ) => {
    const [client, jwtCustomizers] = await Promise.all([
      cloudConnection.getClient(),
      getJwtCustomizers(consoleLog),
    ]);

    const customizerScriptsFromDatabase = getJwtCustomizerScripts(jwtCustomizers);

    const newCustomizerScripts: CustomJwtDeployRequestBody = {
      /**
       * There are at most 4 custom JWT scripts in the `CustomJwtDeployRequestBody`-typed object,
       * and can be indexed by `data[CustomJwtType][UseCase]`.
       *
       * Per our design, each script will be deployed as a API endpoint in the Cloudflare
       * worker service. A production script will be deployed to `/api/custom-jwt`
       * endpoint and a test script will be deployed to `/api/custom-jwt/test` endpoint.
       *
       * If the current use case is `test`, then the script should be deployed to a `/test` endpoint;
       * otherwise, the script should be deployed to the `/api/custom-jwt` endpoint and overwrite
       * previous handler of the API endpoint.
       */
      [payload.key]: { [payload.useCase]: payload.value.script },
    };

    await client.put(`/api/services/custom-jwt/worker`, {
      body: deepmerge(customizerScriptsFromDatabase, newCustomizerScripts),
    });
  };

  const undeployJwtCustomizerScript = async <T extends LogtoJwtTokenKey>(
    consoleLog: ConsoleLog,
    key: T
  ) => {
    const [client, jwtCustomizers] = await Promise.all([
      cloudConnection.getClient(),
      getJwtCustomizers(consoleLog),
    ]);

    assert(jwtCustomizers[key], new RequestError({ code: 'entity.not_exists', key }));

    // Undeploy the worker directly if the only JWT customizer is being deleted.
    if (Object.entries(jwtCustomizers).length === 1) {
      await client.delete(`/api/services/custom-jwt/worker`);
      return;
    }

    // Remove the JWT customizer script (of given `key`) from the existing JWT customizer scripts and redeploy.
    const customizerScriptsFromDatabase = getJwtCustomizerScripts(jwtCustomizers);
    const newCustomizerScripts: CustomJwtDeployRequestBody = {
      [key]: {
        production: undefined,
        test: undefined,
      },
    };

    await client.put(`/api/services/custom-jwt/worker`, {
      body: deepmerge(customizerScriptsFromDatabase, newCustomizerScripts),
    });
  };
  return {
    getUserContext,
    deployJwtCustomizerScript,
    undeployJwtCustomizerScript,
  };
};
