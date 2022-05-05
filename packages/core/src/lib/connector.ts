import pRetry from 'p-retry';

import { hasConnectorWithId } from '@/queries/connector';
import { buildIdGenerator } from '@/utils/id';

const connectorId = buildIdGenerator(10);

export const generateConnectorId = async (retries = 500) =>
  pRetry(
    async () => {
      const id = connectorId();

      if (!(await hasConnectorWithId(id))) {
        return id;
      }

      throw new Error('Cannot generate connector ID in reasonable retries');
    },
    { retries, factor: 0 } // No need for exponential backoff
  );
