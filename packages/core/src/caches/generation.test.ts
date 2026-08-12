import { TtlCache } from '@logto/shared';

import { invalidateWithGeneration, snapshotGeneration, type GuardedKeys } from './generation.js';

const keys: GuardedKeys = { value: 'value', generation: 'generation' };
const createStore = () => new TtlCache<string, string>(60_000);

describe('invalidateWithGeneration()', () => {
  it('should drop the cached value', async () => {
    const store = createStore();
    store.set(keys.value, 'cached');

    await invalidateWithGeneration(store, keys);

    expect(store.get(keys.value)).toBeUndefined();
  });
});

describe('snapshotGeneration()', () => {
  it('should write back when no invalidation happened', async () => {
    const store = createStore();
    const writeBackIfFresh = await snapshotGeneration(store, keys);

    await writeBackIfFresh(async () => {
      store.set(keys.value, 'fresh');
    });

    expect(store.get(keys.value)).toBe('fresh');
  });

  it('should skip the write back when an invalidation landed while the value was computed', async () => {
    const store = createStore();
    const writeBackIfFresh = await snapshotGeneration(store, keys);

    await invalidateWithGeneration(store, keys);
    await writeBackIfFresh(async () => {
      store.set(keys.value, 'stale');
    });

    expect(store.get(keys.value)).toBeUndefined();
  });

  it('should undo the write back when an invalidation lands between the check and the write', async () => {
    const store = createStore();
    const writeBackIfFresh = await snapshotGeneration(store, keys);

    await writeBackIfFresh(async () => {
      await invalidateWithGeneration(store, keys);
      store.set(keys.value, 'stale');
    });

    expect(store.get(keys.value)).toBeUndefined();
  });

  it('should keep guarding across consecutive invalidations', async () => {
    const store = createStore();
    await invalidateWithGeneration(store, keys);

    const writeBackIfFresh = await snapshotGeneration(store, keys);
    await invalidateWithGeneration(store, keys);
    await writeBackIfFresh(async () => {
      store.set(keys.value, 'stale');
    });

    expect(store.get(keys.value)).toBeUndefined();
  });
});
