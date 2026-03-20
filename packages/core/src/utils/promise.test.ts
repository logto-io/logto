import { runNamedTasksWithSummary } from './promise.js';

describe('runNamedTasksWithSummary', () => {
  it('should collect succeeded and failed task names', async () => {
    const result = await runNamedTasksWithSummary({
      items: ['a', 'b', 'c'],
      getName: (item) => item,
      runner: async (item) => {
        if (item === 'b') {
          throw new Error('failed-b');
        }
      },
    });

    expect(result.succeededNames).toEqual(['a', 'c']);
    expect(result.failedTasks).toHaveLength(1);
    expect(result.failedTasks[0]?.name).toBe('b');
    expect(result.failedTasks[0]?.cause).toBeInstanceOf(Error);
  });

  it('should keep input order for succeeded and failed groups', async () => {
    const result = await runNamedTasksWithSummary({
      items: [1, 2, 3, 4],
      getName: (item) => `task-${item}` as const,
      runner: async (item) => {
        if (item % 2 === 0) {
          throw new Error(`failed-${item}`);
        }
      },
    });

    expect(result.succeededNames).toEqual(['task-1', 'task-3']);
    expect(result.failedTasks.map(({ name }) => name)).toEqual(['task-2', 'task-4']);
  });

  it('should normalize cause when normalizeCause is provided', async () => {
    const result = await runNamedTasksWithSummary({
      items: ['a', 'b'],
      getName: (item) => item,
      runner: async (item) => {
        if (item === 'b') {
          throw new Error('failed-b');
        }
      },
      normalizeCause: () => 'normalized-error',
    });

    expect(result.succeededNames).toEqual(['a']);
    expect(result.failedTasks).toEqual([{ name: 'b', cause: 'normalized-error' }]);
  });

  it('should respect concurrency limit when provided', async () => {
    const startedAt = Date.now();

    await runNamedTasksWithSummary({
      items: [1, 2, 3, 4, 5],
      getName: (item) => `task-${item}` as const,
      concurrency: 2,
      runner: async () => {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 20);
        });
      },
    });

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(50);
  });
});
