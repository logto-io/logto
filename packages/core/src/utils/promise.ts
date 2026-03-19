type FailedNamedTask<TName extends string> = {
  name: TName;
  cause: unknown;
};

/**
 * Runs a list of async tasks and returns grouped results by task name.
 *
 * Use this helper when you need batch execution with full error visibility,
 * instead of `Promise.all` fail-fast behavior.
 *
 * - Every task is attempted.
 * - Result keeps the original input order for both succeeded and failed groups.
 * - Failures are captured as `{ name, cause }` so callers can shape domain errors.
 */
export const runNamedTasksWithSummary = async <TName extends string, TItem>({
  items,
  getName,
  runner,
}: {
  items: TItem[];
  getName: (item: TItem) => TName;
  runner: (item: TItem) => Promise<void>;
}) => {
  const settledResults = await Promise.all(
    items.map(async (item) => {
      const name = getName(item);
      try {
        await runner(item);
        return { name };
      } catch (error: unknown) {
        return { name, cause: error };
      }
    })
  );

  return settledResults.reduce<{
    succeededNames: TName[];
    failedTasks: Array<FailedNamedTask<TName>>;
  }>(
    (result, current) => {
      if ('cause' in current) {
        return {
          ...result,
          failedTasks: [...result.failedTasks, { name: current.name, cause: current.cause }],
        };
      }

      return {
        ...result,
        succeededNames: [...result.succeededNames, current.name],
      };
    },
    { succeededNames: [], failedTasks: [] }
  );
};
