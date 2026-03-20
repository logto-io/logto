import { normalizeError } from '@logto/shared';
import { pick } from '@silverhand/essentials';
import pMap from 'p-map';

import RequestError from '#src/errors/RequestError/index.js';

type NamedTaskSummary<TName extends string, TCause = unknown> = {
  succeededNames: TName[];
  failedTasks: Array<{ name: TName; cause: TCause }>;
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
 * - Supports optional concurrency limits via `concurrency`.
 */
export function runNamedTasksWithSummary<TName extends string, TItem>(args: {
  items: TItem[];
  getName: (item: TItem) => TName;
  runner: (item: TItem) => Promise<void>;
  concurrency?: number;
}): Promise<NamedTaskSummary<TName>>;

export function runNamedTasksWithSummary<TName extends string, TItem, TCause>(args: {
  items: TItem[];
  getName: (item: TItem) => TName;
  runner: (item: TItem) => Promise<void>;
  normalizeCause: (cause: unknown) => TCause;
  concurrency?: number;
}): Promise<NamedTaskSummary<TName, TCause>>;

export async function runNamedTasksWithSummary<TName extends string, TItem, TCause>({
  items,
  getName,
  runner,
  normalizeCause,
  concurrency,
}: {
  items: TItem[];
  getName: (item: TItem) => TName;
  runner: (item: TItem) => Promise<void>;
  normalizeCause?: (cause: unknown) => TCause;
  concurrency?: number;
}): Promise<NamedTaskSummary<TName>> {
  const settledResults = await pMap(
    items,
    async (item) => {
      const name = getName(item);
      try {
        await runner(item);
        return { name };
      } catch (error: unknown) {
        return { name, cause: normalizeCause ? normalizeCause(error) : error };
      }
    },
    { concurrency }
  );

  return settledResults.reduce<NamedTaskSummary<TName>>(
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
}

export const serializeErrorCause = (error: unknown) => {
  if (error instanceof RequestError) {
    /** @see RequestError.toBody */
    return pick(error, 'code', 'data', 'details');
  }

  return normalizeError(error).message;
};
