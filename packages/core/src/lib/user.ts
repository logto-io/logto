import pRetry from 'p-retry';

import { hasUserWithId } from '@/queries/user';
import { buildIdGenerator } from '@/utils/id';

const userId = buildIdGenerator(12);

// LOG-89: Add unit tests
export const generateUserId = async (retries = 500) =>
  pRetry(
    async () => {
      const id = userId();

      if (!(await hasUserWithId(id))) {
        return id;
      }

      throw new Error('Cannot generate user ID in reasonable retries');
    },
    { retries, factor: 0 } // No need for exponential backoff
  );
