import { type UserInfo } from '@logto/schemas';
import originalKy, { type Options, type KyInstance } from 'ky';

/**
 * CAUTION: The current implementation is based on the admin tenant's `/me` API which is interim.
 * The final implementation should be based on the Account API.
 */
export class LogtoAccountApi {
  protected ky: KyInstance;

  constructor(init: KyInstance | Options) {
    this.ky = 'create' in init ? init : originalKy.create(init);
  }

  async getUser() {
    return this.ky('me').json<UserInfo>();
  }

  async updateUser(user: Partial<UserInfo>) {
    return this.ky.patch('me', { json: user }).json<UserInfo>();
  }
}
