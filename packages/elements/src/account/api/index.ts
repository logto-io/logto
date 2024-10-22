import ky, { type KyInstance } from 'ky';

import { type UserProfile } from '../types.js';

export type GetAccessToken = () => Promise<string>;

/**
 * The API client for the Logto account elements
 *
 * Used to interact with Account-related backend APIs, including the Profile API.
 */
export class LogtoAccountApi {
  private readonly ky: KyInstance;

  constructor(
    /**
     * The endpoint URL of the Logto service.
     *
     * Example: 'https://your-tenant-id.logto.app'
     */
    logtoEndpoint: string,
    /**
     * Obtains the access token for Account-related API interactions.
     *
     * Called every time the account elements make a request to the backend API.
     *
     * Should handle access token expiration and request a new token when needed.
     *
     * Note: If using the `getAccessToken` method provided by the Logto SDK,
     * it already ensures a valid access token is obtained.
     */
    getAccessToken: GetAccessToken
  ) {
    this.ky = ky.create({
      prefixUrl: logtoEndpoint,
      hooks: {
        beforeRequest: [
          async (request) => {
            request.headers.set('Authorization', `Bearer ${await getAccessToken()}`);
          },
        ],
      },
    });
  }

  async fetchUserProfile() {
    return this.ky.get('api/profile').json<UserProfile>();
  }
}
