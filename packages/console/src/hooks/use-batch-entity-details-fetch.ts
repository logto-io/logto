import { useCallback } from 'react';

import useApi from './use-api';

const maxEntityDetailFetchConcurrency = 5;

const normalizeConcurrency = (concurrency: number) =>
  Number.isFinite(concurrency)
    ? Math.max(1, Math.floor(concurrency))
    : maxEntityDetailFetchConcurrency;

/**
 * Returns a typed entity-detail fetcher that loads `{pathname}/{id}` resources in bounded batches.
 *
 * The returned fetcher preserves the input ID order, runs requests in each batch in parallel, and
 * keeps the previous fail-fast behavior: if any entity request rejects, the whole fetch rejects and
 * remaining batches are not started.
 */
const useBatchEntityDetailsFetch = (concurrency = maxEntityDetailFetchConcurrency) => {
  const api = useApi();

  return useCallback(
    async <TEntity>(pathname: string, ids: string[]) => {
      const normalizedConcurrency = normalizeConcurrency(concurrency);
      const entityIdBatches = Array.from(
        { length: Math.ceil(ids.length / normalizedConcurrency) },
        (_, index) => ids.slice(index * normalizedConcurrency, (index + 1) * normalizedConcurrency)
      );

      // Run batches sequentially so large rule lists do not create an unbounded request burst.
      const entityBatches = await entityIdBatches.reduce<Promise<TEntity[][]>>(
        async (previousBatches, entityIdBatch) => [
          ...(await previousBatches),
          // Keep each batch parallel and fail-fast, matching the previous Promise.all behavior.
          await Promise.all(
            entityIdBatch.map(async (id) => api.get(`${pathname}/${id}`).json<TEntity>())
          ),
        ],
        Promise.resolve([])
      );

      return entityBatches.flat();
    },
    [api, concurrency]
  );
};

export default useBatchEntityDetailsFetch;
