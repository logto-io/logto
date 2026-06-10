import { renderHook, waitFor } from '@testing-library/react';

import useApi from './use-api';
import useBatchEntityDetailsFetch from './use-batch-entity-details-fetch';

jest.mock('./use-api', () => ({
  __esModule: true,
  default: jest.fn(),
}));

type TestEntity = {
  id: string;
  name: string;
};

const mockedUseApi = jest.mocked(useApi);

const createApi = () => ({
  get: jest.fn((pathname: string) => ({
    json: async () => {
      const id = pathname.split('/').at(-1) ?? '';

      return { id, name: `entity-${id}` };
    },
  })),
});

const createDeferredEntity = (id: string) => {
  // eslint-disable-next-line @silverhand/fp/no-let -- Tests need a controlled resolver.
  let resolveDeferredEntity: (entity: TestEntity) => void;
  const promise = new Promise<TestEntity>((resolve) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests need a controlled resolver.
    resolveDeferredEntity = resolve;
  });

  return {
    promise,
    resolve: () => {
      resolveDeferredEntity({ id, name: `entity-${id}` });
    },
  };
};

describe('useBatchEntityDetailsFetch', () => {
  it('keeps the input order', async () => {
    const api = createApi();
    mockedUseApi.mockReturnValue(api as unknown as ReturnType<typeof useApi>);
    const { result } = renderHook(() => useBatchEntityDetailsFetch());

    const entities = await result.current<TestEntity>('api/entities', ['1', '2', '3']);

    expect(entities).toEqual([
      { id: '1', name: 'entity-1' },
      { id: '2', name: 'entity-2' },
      { id: '3', name: 'entity-3' },
    ]);
    expect(api.get).toHaveBeenCalledWith('api/entities/1');
    expect(api.get).toHaveBeenCalledWith('api/entities/2');
    expect(api.get).toHaveBeenCalledWith('api/entities/3');
  });

  it('supports a custom fetcher', async () => {
    const api = createApi();
    const fetchEntity = jest.fn(async ({ id }: { id: string }) => ({
      id,
      name: `custom-${id}`,
    }));
    mockedUseApi.mockReturnValue(api as unknown as ReturnType<typeof useApi>);
    const { result } = renderHook(() => useBatchEntityDetailsFetch());

    const entities = await result.current<TestEntity, { id: string }>(
      'api/entities',
      [{ id: '1' }, { id: '2' }],
      fetchEntity
    );

    expect(entities).toEqual([
      { id: '1', name: 'custom-1' },
      { id: '2', name: 'custom-2' },
    ]);
    expect(fetchEntity).toHaveBeenCalledTimes(2);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('requires a custom fetcher for non-string items', async () => {
    const api = createApi();
    mockedUseApi.mockReturnValue(api as unknown as ReturnType<typeof useApi>);
    const { result } = renderHook(() => useBatchEntityDetailsFetch());

    await expect(
      result.current<TestEntity, { id: string }>('api/entities', [{ id: '1' }])
    ).rejects.toThrow('A custom fetcher is required for non-string entity detail items.');
    expect(api.get).not.toHaveBeenCalled();
  });

  it('respects the concurrency limit', async () => {
    const pendingEntities = new Map<string, ReturnType<typeof createDeferredEntity>>();
    const api = {
      get: jest.fn((pathname: string) => {
        const id = pathname.split('/').at(-1) ?? '';
        const deferredEntity = createDeferredEntity(id);
        pendingEntities.set(id, deferredEntity);

        return {
          json: async () => deferredEntity.promise,
        };
      }),
    };
    mockedUseApi.mockReturnValue(api as unknown as ReturnType<typeof useApi>);
    const { result } = renderHook(() => useBatchEntityDetailsFetch(2.5));

    const fetchPromise = result.current<TestEntity>('api/entities', ['1', '2', '3', '4', '5']);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
    pendingEntities.get('1')?.resolve();
    pendingEntities.get('2')?.resolve();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(4);
    });
    pendingEntities.get('3')?.resolve();
    pendingEntities.get('4')?.resolve();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(5);
    });
    pendingEntities.get('5')?.resolve();

    await expect(fetchPromise).resolves.toEqual([
      { id: '1', name: 'entity-1' },
      { id: '2', name: 'entity-2' },
      { id: '3', name: 'entity-3' },
      { id: '4', name: 'entity-4' },
      { id: '5', name: 'entity-5' },
    ]);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back to default concurrency for %p',
    async (concurrency) => {
      const api = createApi();
      mockedUseApi.mockReturnValue(api as unknown as ReturnType<typeof useApi>);
      const { result } = renderHook(() => useBatchEntityDetailsFetch(concurrency));

      const entities = await result.current<TestEntity>('api/entities', ['1', '2', '3']);

      expect(entities).toEqual([
        { id: '1', name: 'entity-1' },
        { id: '2', name: 'entity-2' },
        { id: '3', name: 'entity-3' },
      ]);
      expect(api.get).toHaveBeenCalledTimes(3);
    }
  );

  it('stops remaining batches when a batch request fails', async () => {
    const api = {
      get: jest.fn((pathname: string) => ({
        json: async () => {
          const id = pathname.split('/').at(-1) ?? '';

          if (id === '2') {
            throw new Error('Failed to fetch entity.');
          }

          return { id, name: `entity-${id}` };
        },
      })),
    };
    mockedUseApi.mockReturnValue(api as unknown as ReturnType<typeof useApi>);
    const { result } = renderHook(() => useBatchEntityDetailsFetch(2));

    await expect(result.current<TestEntity>('api/entities', ['1', '2', '3'])).rejects.toThrow(
      'Failed to fetch entity.'
    );

    expect(api.get).toHaveBeenCalledWith('api/entities/1');
    expect(api.get).toHaveBeenCalledWith('api/entities/2');
    expect(api.get).not.toHaveBeenCalledWith('api/entities/3');
  });
});
