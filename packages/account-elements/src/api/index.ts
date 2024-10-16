import { type UserProfileResponse } from '@logto/schemas';
import ky, { type KyInstance } from 'ky';

export type AccessTokenFetcher = () => Promise<string>;

/**
 * The API client for the Logto account elements
 *
 * Used internally to interact with Account-related backend APIs, including the Profile API.
 */
export class LogtoAccountApi {
  private readonly ky: KyInstance;

  constructor(
    /**
     * The endpoint of the Logto instance.
     */
    logtoEndpoint: string,
    /**
     * The function to fetch the account access token.
     */
    accessTokenFetcher: AccessTokenFetcher
  ) {
    this.ky = ky.create({
      prefixUrl: logtoEndpoint,
      hooks: {
        beforeRequest: [
          async (request) => {
            request.headers.set('Authorization', `Bearer ${await accessTokenFetcher()}`);
          },
        ],
      },
    });
  }

  async fetchUserProfile() {
    return this.ky.get('api/profile').json<UserProfileResponse>();
  }
}
