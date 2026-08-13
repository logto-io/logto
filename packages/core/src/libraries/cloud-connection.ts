import type router from '@logto/cloud/routes';
import { cloudConnectionDataGuard, CloudScope } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
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
 * here.
 */
const workerResourceIndicator = 'https://*.logto.workers.dev';
const workerScriptRunScope = 'invoke:worker:script-run';

type MintedAccessToken = { expiresAt: number; accessToken: string };

/** The cache key of the Cloud API resource, whose value is only known after reading credentials. */
const cloudResourceCacheKey = '';

/** The library for connecting to Logto Cloud service. */
export class CloudConnectionLibrary {
  private client?: Client<typeof router>;
  /** The minted tokens by resource. Audiences differ, so they are never interchangeable. */
  private readonly accessTokenCache = new Map<string, MintedAccessToken>();

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
  public getAccessToken = async (): Promise<string> =>
    this.getCachedAccessToken(cloudResourceCacheKey, scopes.join(' '));

  /**
   * Get the access token for invoking the script-runner Worker directly, minted with the same
   * cloud-connection M2M credentials as {@link getAccessToken} but for the worker resource.
   */
  public getWorkerAccessToken = async (): Promise<string> =>
    this.getCachedAccessToken(workerResourceIndicator, workerScriptRunScope);

  /**
   * Drop the cached Worker token so the next call mints a fresh one.
   *
   * The cache is otherwise only invalidated by time, so a token invalidated before its expiry —
   * admin-tenant key rotation, a missing grant — would break every script run for the rest of its
   * lifetime. The Worker transport calls this when the Worker rejects the token.
   */
  public invalidateWorkerAccessToken = (): void => {
    this.accessTokenCache.delete(workerResourceIndicator);
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
   * Mint an access token via the client credentials flow against the admin tenant, caching it
   * under `resourceKey` until it expires. The margin keeps a token that is about to expire from
   * being handed to a call that outlives it.
   *
   * `resourceKey` is the resource indicator to request, or {@link cloudResourceCacheKey} for the
   * Cloud API resource carried by the stored credentials.
   */
  private readonly getCachedAccessToken = async (
    resourceKey: string,
    scope: string
  ): Promise<string> => {
    const cached = this.accessTokenCache.get(resourceKey);

    if (cached && cached.expiresAt > Date.now() / 1000 + accessTokenExpirationMargin) {
      return cached.accessToken;
    }

    const minted = await this.requestAccessToken(resourceKey, scope);
    this.accessTokenCache.set(resourceKey, minted);

    return minted.accessToken;
  };

  private readonly requestAccessToken = async (
    resourceKey: string,
    scope: string
  ): Promise<MintedAccessToken> => {
    const { tokenEndpoint, appId, appSecret, resource } = await this.getCloudConnectionData();
    const targetResource = resourceKey === cloudResourceCacheKey ? resource : resourceKey;

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
    };
  };
}

export const createCloudConnectionLibrary = (logtoConfigs: LogtoConfigLibrary) => {
  return new CloudConnectionLibrary(logtoConfigs);
};
