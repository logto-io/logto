import { Storage, StorageKey } from '@logto/node';
import { Nullable } from '@silverhand/essentials';

export class MemoryStorage implements Storage {
  private storage: { [key in StorageKey]: Nullable<string> } = {
    idToken: null,
    refreshToken: null,
    accessToken: null,
    signInSession: null,
  };

  async getItem(key: StorageKey): Promise<Nullable<string>> {
    return this.storage[key];
  }

  async setItem(key: StorageKey, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async removeItem(key: StorageKey): Promise<void> {
    this.storage[key] = null;
  }
}
