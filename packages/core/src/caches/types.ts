import { type Optional } from '@silverhand/essentials';

export type CacheStore<Key = string, Value = string> = {
  get(key: Key): Promise<Optional<Value>> | Optional<Value>;
  set(key: Key, value: Value): Promise<void | boolean> | void | boolean;
  delete(key: Key): Promise<void | boolean> | void | boolean;
};
