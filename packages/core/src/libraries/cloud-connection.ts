import type router from '@logto/cloud/routes';
import { cloudConnectionDataGuard, CloudScope } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { appendPath, type Optional } from '@silverhand/essentials';
import Client from '@withtyped/client';
import ky from 'ky';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { safeParseJson } from '#src/utils/json.js';

import { type LogtoConfigLibrary } from './logto-config.js';

export const cloudConnectionGuard = cloudConnectionDataGuard.extend({
  tokenEndpoint: z.string(),
  endpoint: z.string(),
});

export type CloudConnection = z.infer<typeof cloudConnectionGuard>;

const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string().optional(),
});

/**
 * The scope here can be empty and still work, because the cloud API requests made using this client do not rely on scope verification.
 * The `CloudScope.SendEmail` is added for now because it needs to call the cloud email service API.
 * The `CloudScope.FetchCustomJwt` is added for now because it needs to call the cloud custom JWT service API.
 * The `CloudScope.ReportSubscriptionUpdates` is added since we need to report subscription updates to the cloud.
 */
const scopes: string[] = [
  CloudScope.SendEmail,
  CloudScope.FetchCustomJwt,
  CloudScope.ReportSubscriptionUpdates,
];
const accessTokenExpirationMargin = 60;

/**
 * The OAuth resource indicator of the Cloudflare Worker APIs, and the scope granting invocation
 * of the script-runner Worker.
 *
 * Mirror `workerResourceIndicator` / `WorkerScope.InvokeScriptRunner` in `@logto/cloud-models`
 * (`consts/worker.ts`) — that package ships no runtime code to core, so the pair is redeclared
 * here. The Worker rejects a token missing either value, which keeps a drift from failing
 * silently.
 */
const workerResourceIndicator = 'https://*.logto.workers.dev';
const workerScriptRunScope = 'invoke:worker:script-run';

type MintedAccessToken = { expiresAt: number; accessToken: string; scope?: string };

/**
 * The cached token if it is still fresh enough to use, `undefined` otherwise.
 *
 * The margin keeps a token that is about to expire from being handed to a call that outlives it.
 */
const readFreshToken = (cache?: MintedAccessToken): Optional<string> => {
  if (cache && cache.expiresAt > Date.now() / 1000 + accessTokenExpirationMargin) {
    return cache.accessToken;
  }
};

/** The library for connecting to Logto Cloud service. */
export class CloudConnectionLibrary {
  private client?: Client<typeof router>;
  private accessTokenCache?: MintedAccessToken;
  private workerAccessTokenCache?: MintedAccessToken;
  /**
   * The in-flight mint per resource, so concurrent misses share one credentials query and one
   * admin-tenant token request instead of herding.
   *
   * This runs inline in token issuance: without coalescing, every time a busy tenant's token
   * crosses the expiry margin all of its concurrent issuances mint at once, and the
   * missing-scope failure below — deliberately uncached — would re-mint on every single run
   * fleet-wide until the grant lands. Cleared on settle so a rejection is immediately retryable.
   */
  private readonly pendingMints = new Map<string, Promise<MintedAccessToken>>();

  constructor(private readonly logtoConfigs: LogtoConfigLibrary) {}

  public getCloudConnectionData = async (): Promise<CloudConnection> => {
    const { getCloudConnectionData: getCloudServiceM2mCredentials } = this.logtoConfigs;
    const credentials = await getCloudServiceM2mCredentials();
    const { cloudUrlSet, adminUrlSet } = EnvSet.values;
    return {
      ...credentials,
      tokenEndpoint: appendPath(adminUrlSet.endpoint, 'oidc/token').toString(),
      endpoint: appendPath(cloudUrlSet.endpoint, 'api').toString(),
    };
  };

  /**
   * Get the access token for the Cloud service in the following steps:
   *
   * 1. If the access token is cached and not expired, return it.
   * 2. Otherwise, get a new access token from the Cloud service via client
   * credentials flow and cache it.
   * 3. If the request fails, throw an error.
   *
   * @returns The access token for the Cloud service.
   */
  public getAccessToken = async (): Promise<string> => {
    const cached = readFreshToken(this.accessTokenCache);

    if (cached) {
      return cached;
    }

    this.accessTokenCache = await this.mintAccessToken(scopes.join(' '));

    return this.accessTokenCache.accessToken;
  };

  /**
   * Get the access token for invoking the script-runner Worker directly, minted with the same
   * cloud-connection M2M credentials as {@link getAccessToken} but for the worker resource.
   *
   * Cached separately from the Cloud service token — the two differ in audience and are not
   * interchangeable.
   */
  public getWorkerAccessToken = async (): Promise<string> => {
    const cached = readFreshToken(this.workerAccessTokenCache);

    if (cached) {
      return cached;
    }

    const { scope, ...minted } = await this.mintAccessToken(
      workerScriptRunScope,
      workerResourceIndicator
    );

    /**
     * The OIDC provider filters the requested scope down to what the credentials' roles grant
     * and still answers 200, so an ungranted scope surfaces here rather than as an
     * `invalid_scope` error. Failing without caching keeps the misprovisioning loud and
     * immediately retryable — a cached scopeless token would 401 on the Worker for the rest of
     * its lifetime.
     */
    if (!scope?.split(' ').includes(workerScriptRunScope)) {
      throw new Error(
        `The minted worker access token is missing the \`${workerScriptRunScope}\` scope. ` +
          'Is the admin tenant alteration granting it to the tenant application role deployed?'
      );
    }

    this.workerAccessTokenCache = minted;

    return minted.accessToken;
  };

  /**
   * Drop the cached Worker token so the next call mints a fresh one.
   *
   * The cache is otherwise only invalidated by time, so a token invalidated before its expiry —
   * admin-tenant key rotation, grant revocation — would break every script run for the rest of
   * its lifetime. The Worker transport calls this when the Worker rejects the token.
   */
  public invalidateWorkerAccessToken = (): void => {
    this.workerAccessTokenCache = undefined;
  };

  /**
   * Get a withtyped client for the Cloud service. It is typed with the router
   * defined in @logto/cloud/routes.
   */
  public getClient = async (): Promise<Client<typeof router>> => {
    if (!this.client) {
      const { endpoint } = await this.getCloudConnectionData();

      this.client = new Client<typeof router>({
        // TODO @sijie @darcy remove the 'api' appending in getCloudConnectionData()
        baseUrl: endpoint.replace('/api', ''),
        headers: async () => {
          return { Authorization: `Bearer ${await this.getAccessToken()}` };
        },
      });
    }

    return this.client;
  };

  /**
   * Mint an access token via the client credentials flow against the admin tenant, for
   * `resourceOverride` when given and the Cloud API resource of the stored credentials otherwise.
   *
   * Concurrent calls for the same resource share one in-flight request; see {@link pendingMints}.
   *
   * `scope` echoes what the provider actually granted, which can be less than what was asked.
   */
  private readonly mintAccessToken = async (
    scope: string,
    resourceOverride?: string
  ): Promise<MintedAccessToken> => {
    const key = resourceOverride ?? '';
    const pending = this.pendingMints.get(key);

    if (pending) {
      return pending;
    }

    const mint = (async () => {
      try {
        return await this.requestAccessToken(scope, resourceOverride);
      } finally {
        this.pendingMints.delete(key);
      }
    })();

    this.pendingMints.set(key, mint);

    return mint;
  };

  private readonly requestAccessToken = async (
    scope: string,
    resourceOverride?: string
  ): Promise<MintedAccessToken> => {
    const { tokenEndpoint, appId, appSecret, resource } = await this.getCloudConnectionData();
    const targetResource = resourceOverride ?? resource;

    const text = await ky
      .post(tokenEndpoint, {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          resource: targetResource,
          scope,
        }),
      })
      .text();

    const result = accessTokenResponseGuard.safeParse(safeParseJson(text));

    if (!result.success) {
      throw new Error(`Unable to get access token for resource \`${targetResource}\``);
    }

    return {
      expiresAt: Date.now() / 1000 + result.data.expires_in,
      accessToken: result.data.access_token,
      scope: result.data.scope,
    };
  };
}

export const createCloudConnectionLibrary = (logtoConfigs: LogtoConfigLibrary) => {
  return new CloudConnectionLibrary(logtoConfigs);
};
