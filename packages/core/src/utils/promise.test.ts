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
});
