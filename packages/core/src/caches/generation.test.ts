import { TtlCache } from '@logto/shared';

import { invalidateWithGeneration, snapshotGeneration, type GuardedKeys } from './generation.js';

const keys: GuardedKeys = { value: 'value', generation: 'generation' };
const createStore = () => new TtlCache<string, string>(60_000);

/**
 * Records the write operations in the order they were issued, so the tests can pin the
 * ordering the guard rests on rather than just its end state.
 */
const createRecordingStore = () => {
  const store = createStore();
  const operations: string[] = [];

  return {
    operations,
    get: async (key: string) => store.get(key),
    set: async (key: string, value: string) => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      operations.push(`set:${key}`);
      store.set(key, value);
    },
    delete: async (key: string) => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods
      operations.push(`delete:${key}`);
      store.delete(key);
    },
  };
};

describe('invalidateWithGeneration()', () => {
  it('should drop the cached value', async () => {
    const store = createStore();
    store.set(keys.value, 'cached');

    await invalidateWithGeneration(store, keys);

    expect(store.get(keys.value)).toBeUndefined();
  });

  it('should bump the generation before dropping the value', async () => {
    const store = createRecordingStore();

    await invalidateWithGeneration(store, keys);

    expect(store.operations).toStrictEqual([`set:${keys.generation}`, `delete:${keys.value}`]);
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

  it('should undo with a plain deletion, leaving the generation untouched', async () => {
    const store = createRecordingStore();
    const writeBackIfFresh = await snapshotGeneration(store, keys);

    await writeBackIfFresh(async () => {
      await invalidateWithGeneration(store, keys);
      await store.set(keys.value, 'stale');
    });

    /**
     * Only the invalidation inside the write-back may bump the generation; a bump from the undo
     * itself would make other in-flight reads discard results that are not stale.
     */
    expect(store.operations).toStrictEqual([
      `set:${keys.generation}`,
      `delete:${keys.value}`,
      `set:${keys.value}`,
      `delete:${keys.value}`,
    ]);
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
