import type { PersistKey, Storage } from '@logto/node';
import type { Nullable } from '@silverhand/essentials';

export class MemoryStorage implements Storage<PersistKey> {
  private storage: { [key in PersistKey]: Nullable<string> } = {
    idToken: null,
    refreshToken: null,
    accessToken: null,
    signInSession: null,
  };

  async getItem(key: PersistKey): Promise<Nullable<string>> {
    return this.storage[key];
  }

  async setItem(key: PersistKey, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async removeItem(key: PersistKey): Promise<void> {
    this.storage[key] = null;
  }
}
