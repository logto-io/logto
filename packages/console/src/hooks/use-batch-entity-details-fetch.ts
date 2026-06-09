import { useCallback } from 'react';

import useApi from './use-api';

const maxEntityDetailFetchConcurrency = 5;

const normalizeConcurrency = (concurrency: number) =>
  Number.isFinite(concurrency)
    ? Math.max(1, Math.floor(concurrency))
    : maxEntityDetailFetchConcurrency;

function assertDefaultFetchItem(item: unknown): asserts item is string {
  if (typeof item !== 'string') {
    throw new TypeError('A custom fetcher is required for non-string entity detail items.');
  }
}

const buildDefaultFetchPathname = (pathname: string, item: unknown) => {
  assertDefaultFetchItem(item);

  return `${pathname}/${String(item)}`;
};

/**
 * Returns a typed entity-detail fetcher that loads `{pathname}/{id}` resources in bounded batches.
 *
 * The returned fetcher preserves the input ID order, runs requests in each batch in parallel, and
 * keeps the previous fail-fast behavior: if any entity request rejects, the whole fetch rejects and
 * remaining batches are not started. A custom fetcher can be provided for non-standard endpoints.
 */
const useBatchEntityDetailsFetch = (concurrency = maxEntityDetailFetchConcurrency) => {
  const api = useApi();

  return useCallback(
    async <TEntity, TItem = string>(
      pathname: string,
      items: TItem[],
      fetchEntity?: (item: TItem) => Promise<TEntity>
    ) => {
      const normalizedConcurrency = normalizeConcurrency(concurrency);
      const entityItemBatches = Array.from(
        { length: Math.ceil(items.length / normalizedConcurrency) },
        (_, index) =>
          items.slice(index * normalizedConcurrency, (index + 1) * normalizedConcurrency)
      );
      const fetchItem =
        fetchEntity ??
        (async (item: TItem) => api.get(buildDefaultFetchPathname(pathname, item)).json<TEntity>());

      // Run batches sequentially so large rule lists do not create an unbounded request burst.
      const entityBatches = await entityItemBatches.reduce<Promise<TEntity[][]>>(
        async (previousBatches, entityItemBatch) => [
          ...(await previousBatches),
          // Keep each batch parallel and fail-fast, matching the previous Promise.all behavior.
          await Promise.all(entityItemBatch.map(async (item) => fetchItem(item))),
        ],
        Promise.resolve([])
      );

      return entityBatches.flat();
    },
    [api, concurrency]
  );
};

export default useBatchEntityDetailsFetch;
