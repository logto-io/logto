import type router from '@logto/cloud/routes';
import { cloudConnectionDataGuard, CloudScope } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { appendPath, conditional } from '@silverhand/essentials';
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

/** The library for connecting to Logto Cloud service. */
export class CloudConnectionLibrary {
  private client?: Client<typeof router>;
  private accessTokenCache?: { expiresAt: number; accessToken: string };
  private workerAccessTokenCache?: { expiresAt: number; accessToken: string };

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
    if (this.accessTokenCache) {
      const { expiresAt, accessToken } = this.accessTokenCache;

      if (expiresAt > Date.now() / 1000 + accessTokenExpirationMargin) {
        return accessToken;
      }
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
    if (this.workerAccessTokenCache) {
      const { expiresAt, accessToken } = this.workerAccessTokenCache;

      if (expiresAt > Date.now() / 1000 + accessTokenExpirationMargin) {
        return accessToken;
      }
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
   * `scope` echoes what the provider actually granted, which can be less than what was asked.
   */
  private readonly mintAccessToken = async (
    scope: string,
    resourceOverride?: string
  ): Promise<{ expiresAt: number; accessToken: string; scope?: string }> => {
    const { tokenEndpoint, appId, appSecret, resource } = await this.getCloudConnectionData();

    const text = await ky
      .post(tokenEndpoint, {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          resource: resourceOverride ?? resource,
          scope,
        }),
      })
      .text();

    const result = accessTokenResponseGuard.safeParse(safeParseJson(text));

    if (!result.success) {
      throw new Error('Unable to get access token for Cloud service');
    }

    return {
      expiresAt: Date.now() / 1000 + result.data.expires_in,
      accessToken: result.data.access_token,
      ...conditional(result.data.scope !== undefined && { scope: result.data.scope }),
    };
  };
}

export const createCloudConnectionLibrary = (logtoConfigs: LogtoConfigLibrary) => {
  return new CloudConnectionLibrary(logtoConfigs);
};
