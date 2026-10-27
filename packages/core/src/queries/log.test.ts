import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import type { QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { createLogQueries } = await import('./log.js');
const { deleteLogsBefore } = createLogQueries(pool);

describe('deleteLogsBefore()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  it('deletes with only an upper bound and returns the affected range', async () => {
    mockQuery.mockResolvedValueOnce(
      createMockQueryResult([{ createdAt: 1000 }, { createdAt: 3000 }])
    );

    const result = await deleteLogsBefore({ before: 5000, limit: 100 });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0]?.[1]).toEqual([5000, 100]);

    const [query] = mockQuery.mock.calls[0] ?? [];
    expect(String(query)).toContain('delete from');
    expect(String(query)).toContain('order by');
    expect(String(query)).toContain('limit');

    expect(result).toEqual({ deletedCount: 2, deletedRange: { oldest: 1000, newest: 3000 } });
  });

  it('adds a lower bound when `after` is provided', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([{ createdAt: 2000 }]));

    const result = await deleteLogsBefore({ before: 5000, after: 1500, limit: 10 });

    expect(mockQuery.mock.calls[0]?.[1]).toEqual([5000, 1500, 10]);
    expect(result).toEqual({ deletedCount: 1, deletedRange: { oldest: 2000, newest: 2000 } });
  });

  it('treats `after: 0` as a real bound rather than "absent"', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

    await deleteLogsBefore({ before: 5000, after: 0, limit: 10 });

    expect(mockQuery.mock.calls[0]?.[1]).toEqual([5000, 0, 10]);
  });

  it('omits the range when nothing was deleted', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

    const result = await deleteLogsBefore({ before: 5000, limit: 10 });

    expect(result).toEqual({ deletedCount: 0 });
  });
});
