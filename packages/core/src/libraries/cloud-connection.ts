import type router from '@logto/cloud/routes';
import { cloudConnectionDataGuard, CloudScope } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import Client from '@withtyped/client';
import { got } from 'got';
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
 */
const scopes: string[] = [CloudScope.SendEmail, CloudScope.FetchCustomJwt];
const accessTokenExpirationMargin = 60;

/** The library for connecting to Logto Cloud service. */
export class CloudConnectionLibrary {
  private client?: Client<typeof router>;
  private accessTokenCache?: { expiresAt: number; accessToken: string };

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

    const { tokenEndpoint, appId, appSecret, resource } = await this.getCloudConnectionData();

    const httpResponse = await got.post({
      url: tokenEndpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
      },
      form: {
        grant_type: 'client_credentials',
        resource,
        scope: scopes.join(' '),
      },
    });

    const result = accessTokenResponseGuard.safeParse(safeParseJson(httpResponse.body));

    if (!result.success) {
      throw new Error('Unable to get access token for Cloud service');
    }

    this.accessTokenCache = {
      expiresAt: Date.now() / 1000 + result.data.expires_in,
      accessToken: result.data.access_token,
    };

    return result.data.access_token;
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
}

export const createCloudConnectionLibrary = (logtoConfigs: LogtoConfigLibrary) => {
  return new CloudConnectionLibrary(logtoConfigs);
};
