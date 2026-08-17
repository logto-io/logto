/* eslint-disable max-lines -- The legacy remote paths coexist with the script-runner adapters until LOG-13957 removes the per-tenant worker lifecycle. */
import {
  adminTenantId,
  type CustomJwtErrorBody,
  CustomJwtErrorCode,
  jwtCustomizerUserContextGuard,
  userInfoSelectFields,
  type CustomJwtFetcher,
  type JwtCustomizerType,
  type JwtCustomizerUserContext,
  type JwtCustomizerApplicationContext,
  type JwtCustomizerOrganizationContext,
  jwtCustomizerOrganizationContextGuard,
  type LogtoJwtTokenKey,
  type CustomJwtScriptPayload,
  jsonObjectGuard,
  isBuiltInApplicationId,
  buildBuiltInApplicationDataForTenant,
} from '@logto/schemas';
import { type ConsoleLog } from '@logto/shared';
import {
  assert,
  deduplicate,
  type Optional,
  pick,
  pickState,
  trySafe,
} from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { got, HTTPError } from 'got';
import { type UnknownObject } from 'oidc-provider';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { type ScopeLibrary } from '#src/libraries/scope.js';
import { type SubscriptionLibrary } from '#src/libraries/subscription.js';
import { type UserLibrary } from '#src/libraries/user.js';
import type Queries from '#src/tenants/Queries.js';
import {
  getJwtCustomizerScripts,
  type CustomJwtDeployRequestBody,
  parseAzureFunctionsResponseError,
} from '#src/utils/custom-jwt/index.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';
import {
  buildCloudScriptFailureError,
  buildScriptFailureError,
  runScriptOnCloud,
  runScriptOnWorkerPool,
  ScriptExecutionError,
  scriptFailureStatusCodes,
} from './script-runner/index.js';

/**
 * The error a denial (`api.denyAccess()`) leaves the library as, on every runtime.
 *
 * The `CustomJwtErrorBody` under `error` is what makes the denial recognizable downstream
 * (`isAccessDeniedError`), which is why a `denied` failure never goes through the generic
 * failure-to-error mapping.
 */
const buildAccessDeniedError = (message: string) => {
  const error: CustomJwtErrorBody = {
    code: CustomJwtErrorCode.AccessDenied,
    message,
  };

  return new ScriptExecutionError({ message, error }, scriptFailureStatusCodes.denied);
};

export class JwtCustomizerLibrary {
  // Convert failures to WithTyped client response errors to share the error handling logic.
  static async runScriptLocally(data: CustomJwtFetcher, tenantId: string) {
    /**
     * `api` is not part of the payload: functions cannot cross the structured-clone boundary, so
     * the worker constructs `denyAccess` itself and reports a denial as a `denied` failure.
     */
    const payload: Omit<CustomJwtScriptPayload, 'api'> = pick(
      data,
      'token',
      'context',
      'environmentVariables'
    );

    const result = await runScriptOnWorkerPool({
      script: data.script,
      entry: 'getCustomJwtClaims',
      payload,
      tenantId,
    });

    if (!result.ok) {
      if (result.kind === 'denied') {
        throw buildAccessDeniedError(result.message);
      }

      throw buildScriptFailureError(result);
    }

    return JwtCustomizerLibrary.parseScriptResultValue(result.value);
  }

  /**
   * Validate the value a successful run returned.
   *
   * If it is not a record, we cannot merge it to the existing token payload. This is call-site
   * validation of a successful run, not a runner failure — it keeps the 400.
   */
  private static parseScriptResultValue(value: unknown) {
    const parsed = z.record(z.unknown()).safeParse(value);

    if (!parsed.success) {
      throw new ScriptExecutionError(
        { message: 'Invalid input', errors: parsed.error.errors },
        400
      );
    }

    return parsed.data;
  }

  constructor(
    private readonly tenantId: string,
    private readonly queries: Queries,
    private readonly logtoConfigs: LogtoConfigLibrary,
    private readonly cloudConnection: CloudConnectionLibrary,
    private readonly subscription: SubscriptionLibrary,
    private readonly userLibrary: UserLibrary,
    private readonly scopeLibrary: ScopeLibrary
  ) {}

  get isRegionalAzureFunctionAppConfigured(): boolean {
    const { azureFunctionUntrustedAppKey, azureFunctionUntrustedAppEndpoint } = EnvSet.values;

    return Boolean(azureFunctionUntrustedAppKey && azureFunctionUntrustedAppEndpoint);
  }

  /**
   * We does not include org roles' scopes for the following reason:
   * 1. The org scopes query method requires `limit` and `offset` parameters. Other management API get
   * these APIs from console setup while this library method is a backend used method.
   * 2. Logto developers can get the org roles' id from this user context and hence query the org roles' scopes via management API.
   */
  async getUserContext(userId: string): Promise<JwtCustomizerUserContext> {
    const user = await this.queries.users.findUserById(userId);
    const fullSsoIdentities = await this.userLibrary.findUserSsoIdentities(userId);
    const roles = await this.userLibrary.findUserRoles(userId);
    const rolesScopes = await this.queries.rolesScopes.findRolesScopesByRoleIds(
      roles.map(({ id }) => id)
    );
    const scopeIds = rolesScopes.map(({ scopeId }) => scopeId);
    const scopes = await this.queries.scopes.findScopesByIds(scopeIds);
    const scopesWithResources = await this.scopeLibrary.attachResourceToScopes(scopes);
    const organizationsWithRoles =
      await this.queries.organizations.relations.users.getOrganizationsByUserId(userId);
    const userContext = {
      ...pick(user, ...userInfoSelectFields),
      hasPassword: Boolean(user.passwordEncrypted),
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
  }

  async getApplicationContext(
    tenantId: string,
    clientId: string
  ): Promise<JwtCustomizerApplicationContext | undefined> {
    const application = isBuiltInApplicationId(clientId)
      ? buildBuiltInApplicationDataForTenant(tenantId, clientId)
      : await trySafe(this.queries.applications.findApplicationById(clientId));

    if (!application) {
      return;
    }

    const { secret: _, ...rest } = application;
    return rest;
  }

  /**
   * Fetch the target organization context for organization (API resource) access tokens.
   *
   * Returns `undefined` when the organization cannot be found (e.g. it was deleted between
   * authorization and token issuance), so a missing organization degrades gracefully instead
   * of failing token issuance.
   */
  async getOrganizationContext(
    organizationId: string
  ): Promise<JwtCustomizerOrganizationContext | undefined> {
    const organization = await trySafe(this.queries.organizations.findById(organizationId));

    if (!organization) {
      return;
    }

    return jwtCustomizerOrganizationContextGuard.parse(organization);
  }

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
   *
   * @remarks
   * Deliberately left outside the `SCRIPT_RUNNER_ENDPOINT` selection that {@link runScriptRemotely}
   * makes, so this and {@link undeployJwtCustomizerScript} keep the worker service in sync for a
   * region still on the legacy `POST /api/services/custom-jwt` path. The cost is real and accepted:
   * where the endpoint is set, every save, delete and Console "test" still pays a deploy whose
   * result the script run no longer reads. Both come out with the per-tenant worker lifecycle in
   * LOG-13957.
   */
  async deployJwtCustomizerScript<T extends LogtoJwtTokenKey>(
    consoleLog: ConsoleLog,
    payload: {
      key: T;
      value: JwtCustomizerType[T];
      useCase: 'test' | 'production';
    }
  ) {
    if (!EnvSet.values.isCloud) {
      consoleLog.warn(
        'Early terminate `deployJwtCustomizerScript` since we do not provide dedicated computing resource for OSS version.'
      );
      return;
    }

    if (this.isRegionalAzureFunctionAppConfigured) {
      consoleLog.info(
        'Skipping Cloudflare Workers deployment since regional Azure Function App is configured.'
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore TS2589: caused by router type growth from @logto/cloud
    const [client, jwtCustomizers] = await Promise.all([
      this.cloudConnection.getClient(),
      this.logtoConfigs.getJwtCustomizers(consoleLog),
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
  }

  async undeployJwtCustomizerScript<T extends LogtoJwtTokenKey>(consoleLog: ConsoleLog, key: T) {
    if (!EnvSet.values.isCloud) {
      consoleLog.warn(
        'Early terminate `undeployJwtCustomizerScript` since we do not deploy the script to dedicated computing resource for OSS version.'
      );
      return;
    }

    if (this.isRegionalAzureFunctionAppConfigured) {
      consoleLog.info(
        'Skipping Cloudflare Workers undeployment since regional Azure Function App is configured.'
      );
      return;
    }

    const [client, jwtCustomizers] = await Promise.all([
      this.cloudConnection.getClient(),
      this.logtoConfigs.getJwtCustomizers(consoleLog),
    ]);

    assert(jwtCustomizers[key], new RequestError({ code: 'entity.not_exists', name: key }));

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
  }

  /**
   * @remarks
   * For Logto cloud use only. Run the custom JWT claims script remotely in an isolated environment.
   * For OSS version, use @see JwtCustomizerLibrary.runScriptLocally instead.
   *
   * @param payload - The custom JWT fetcher payload.
   * @param isTest - Whether to run the script in test mode.
   */
  async runScriptRemotely(
    payload: CustomJwtFetcher,
    isTest?: boolean
  ): Promise<Optional<UnknownObject>> {
    /**
     * The legacy runtimes are kept as a per-region fallback rather than retired: a script runner
     * outage is then routed around by unsetting `SCRIPT_RUNNER_ENDPOINT` on that region's core,
     * with no code change and no coordinated rollback.
     *
     * A region where the endpoint is not injected yet therefore keeps running on the legacy
     * runtimes instead of failing.
     */
    const { scriptRunnerEndpoint } = EnvSet.values;

    if (!scriptRunnerEndpoint) {
      return this.runScriptOnLegacyRuntime(payload, isTest);
    }

    /**
     * The plan quota is enforced here rather than left to the transport: the runner only verifies
     * audience and scope, so without this check the script of a downgraded tenant would keep
     * running and injecting its claims into every issued token.
     *
     * The Management API routes carry `koaQuotaGuard` already, so this only ever fires on the
     * issuance path, where no guard runs. Mirrors `ActionLibrary.isActionsEnabledByQuota`.
     *
     * Returning here rather than throwing is the intended behavior, and matches what
     * `ActionLibrary.runAction` does for its own quota check: a plan downgrade must not break
     * token issuance. The caller reads this as "no custom claims", so a customizer configured
     * with `blockIssuanceOnError` still gets its token — the quota is not a script error.
     */
    if (!(await this.isCustomJwtEnabledByQuota())) {
      return;
    }

    /**
     * `api` is not part of the payload — it carries a function and cannot travel over the wire.
     * The runner merges it in inside the isolate and reports a denial as a `denied` failure,
     * exactly like the worker-thread runner does.
     */
    const value = await this.postScriptRun(payload, scriptRunnerEndpoint, isTest);

    return JwtCustomizerLibrary.parseScriptResultValue(value);
  }

  /**
   * Whether the tenant's plan allows running a custom JWT script.
   *
   * OSS and the admin tenant are never metered; every other tenant reads the cached subscription
   * quota.
   */
  private async isCustomJwtEnabledByQuota(): Promise<boolean> {
    const { isCloud } = EnvSet.values;

    if (!isCloud || this.tenantId === adminTenantId) {
      return true;
    }

    const { quota } = await this.subscription.getSubscriptionData();

    return quota.customJwtEnabled;
  }

  /**
   * The legacy remote paths, kept as the per-region fallback for the Cloud script runner:
   * the regional untrusted Azure Function app where configured, otherwise the deprecated
   * `POST /api/services/custom-jwt` cloud endpoint.
   *
   * Selected whenever `SCRIPT_RUNNER_ENDPOINT` is unset. `isTest` is not forwarded to the function
   * app: that runtime has no notion of a dry run, and nothing is lost by it — vm2 builds a fresh
   * VM per call, so a test run can never share state with production the way a warm isolate could.
   */
  private async runScriptOnLegacyRuntime(
    payload: CustomJwtFetcher,
    isTest?: boolean
  ): Promise<Optional<UnknownObject>> {
    const { azureFunctionUntrustedAppKey, azureFunctionUntrustedAppEndpoint } = EnvSet.values;

    if (this.isRegionalAzureFunctionAppConfigured) {
      try {
        const result = await got
          .post(new URL('/api/custom-jwt', azureFunctionUntrustedAppEndpoint), {
            json: payload,
            headers: {
              'x-functions-key': azureFunctionUntrustedAppKey,
            },
          })
          .json<unknown>();

        const parsedResult = jsonObjectGuard.parse(result);
        return parsedResult;
      } catch (error: unknown) {
        // Convert got HTTPError to WithTyped client ResponseError for unified error handling.
        if (error instanceof HTTPError) {
          throw parseAzureFunctionsResponseError(error);
        }

        throw error;
      }
    }

    // Fallback to use cloud connection to call the custom JWT API.
    const client = await this.cloudConnection.getClient();
    return client.post(`/api/services/custom-jwt`, {
      body: payload,
      search: isTest ? { isTest: 'true' } : {},
    });
  }

  /**
   * Post the run to the Cloud script runner, mapping a script failure onto the same
   * `ScriptExecutionError` the local runners produce.
   */
  private async postScriptRun(
    payload: CustomJwtFetcher,
    endpoint: string,
    isTest?: boolean
  ): Promise<unknown> {
    const result = await runScriptOnCloud({
      cloudConnection: this.cloudConnection,
      endpoint,
      tenantId: this.tenantId,
      script: payload.script,
      entry: 'getCustomJwtClaims',
      payload: pick(payload, 'token', 'context', 'environmentVariables'),
      isTest,
    });

    if (!result.ok) {
      throw result.kind === 'denied'
        ? buildAccessDeniedError(result.message)
        : buildCloudScriptFailureError(result);
    }

    return result.value;
  }
}

/* eslint-enable max-lines */
