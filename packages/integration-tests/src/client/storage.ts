import { Storage, StorageKey } from '@logto/node';
import { Nullable } from '@silverhand/essentials';

export class MemoryStorage implements Storage {
  private storage: { [key in StorageKey]: Nullable<string> } = {
    idToken: null,
    refreshToken: null,
    accessToken: null,
    signInSession: null,
  };

  getItem(key: StorageKey): Nullable<string> {
    return this.storage[key];
  }

  setItem(key: StorageKey, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: StorageKey): void {
    this.storage[key] = null;
  }
}
