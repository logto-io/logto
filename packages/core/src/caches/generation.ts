import { generateStandardShortId } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';

import { type CacheStore } from './types.js';

/**
 * The pair of store keys a guarded cache entry occupies: the value itself, and the marker
 * tracking the invalidations it has been through.
 *
 * The two keyspaces must be disjoint by construction, since the free-form part of a key (a
 * resource indicator, a hostname) is not ours to constrain: either give the marker its own
 * prefix, or place its segment ahead of everything free-form.
 */
export type GuardedKeys = {
  value: string;
  generation: string;
};

/**
 * Read the current invalidation generation. Store errors are silently caught and read as
 * `undefined`, which compares equal to another failed read: a store that cannot answer must
 * not be taken as evidence that an invalidation happened.
 */
const readGeneration = async (store: CacheStore, keys: GuardedKeys) =>
  trySafe(async () => store.get(keys.generation));

/**
 * Invalidate a guarded cache entry, after the mutation it reflects has been committed.
 *
 * The generation must be bumped before deleting, and both must be awaited: once this function
 * resolves, in-flight reads that computed from pre-mutation state either fail the check in
 * {@link snapshotGeneration} or have their write-back removed by the deletion. Callers must
 * therefore await it before returning to their own caller.
 *
 * That holds while the store answers from one authoritative view and applies commands in the
 * order they were issued, which is what a single Redis instance gives us. Three ways it
 * degrades, all of which cap staleness at the value TTL rather than leaving it unbounded:
 * store errors are silently caught here; a generation read served by a lagging replica (the
 * cluster client enables `useReplicas`) can miss a bump that already landed on the primary;
 * and a command that timed out client-side is not cancelled, so a write-back that appeared to
 * fail may still land after this resolved. Closing the last two needs a server-side atomic
 * guard (both keys in one slot, compared and written in a single primary-side operation).
 *
 * A short id suffices as the generation value: it is only ever compared against the
 * immediately preceding one, so it needs to differ from a single known value rather than be
 * globally unique.
 */
export const invalidateWithGeneration = async (store: CacheStore, keys: GuardedKeys) => {
  await trySafe(async () => store.set(keys.generation, generateStandardShortId()));
  await trySafe(async () => store.delete(keys.value));
};

/**
 * Snapshot the invalidation generation before computing a value, and return the write-back to
 * run once it has been computed.
 *
 * The returned function performs the write only if no invalidation landed since the snapshot,
 * and undoes it if one lands between that check and the write itself. A caller that decides
 * not to cache its result (a miss it does not want to remember, say) simply never calls it.
 *
 * That undo is a plain deletion rather than a full {@link invalidateWithGeneration}: bumping
 * the generation here would make other in-flight reads discard results that are not stale. It
 * removes whatever the key holds, which may be a fresher value written by a reader that started
 * after the invalidation — one extra miss, never staleness.
 *
 * Guarding is best-effort, and its two failure directions are not symmetric. A dropped
 * generation write leaves staleness bounded by the value TTL, as it was before generations
 * existed. A generation read that fails, times out, or lands on a lagging replica can instead
 * report an invalidation that never happened, since {@link readGeneration} cannot tell that
 * apart from an absent marker; that costs at most a skipped or undone write-back.
 */
export const snapshotGeneration = async (store: CacheStore, keys: GuardedKeys) => {
  const generation = await readGeneration(store, keys);
  const isInvalidated = async () => (await readGeneration(store, keys)) !== generation;

  return async (writeBack: () => Promise<unknown>) => {
    if (await isInvalidated()) {
      return;
    }

    await trySafe(writeBack);

    if (await isInvalidated()) {
      await trySafe(async () => store.delete(keys.value));
    }
  };
};
