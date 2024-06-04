/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-await-in-loop */
/* eslint-disable @silverhand/fp/no-mutation */

import { Resources } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { type ResourceSeeder } from './ogcio-seeder.js';
import { createItem } from './queries.js';

const createResource = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  appToSeed: SeedingResource
) =>
  createItem({
    transaction,
    tenantId,
    toInsert: appToSeed,
    toLogFieldName: 'name',
    whereClauses: [sql`indicator = ${appToSeed.indicator}`],
    tableName: Resources.table,
  });

const setResourceId = async (
  element: SeedingResource,
  transaction: DatabaseTransactionConnection,
  tenantId: string
): Promise<
  Omit<SeedingResource, 'id'> & {
    id: string;
  }
> => {
  const outputValue = await createResource(transaction, tenantId, element);

  return outputValue;
};

export type SeedingResource = {
  id?: string;
  name: string;
  indicator: string;
  is_default?: boolean;
  access_token_ttl?: number;
};

const fillResource = (resourceSeeder: ResourceSeeder): SeedingResource => ({
  name: resourceSeeder.name,
  indicator: resourceSeeder.indicator,
  is_default: false,
  access_token_ttl: 3600,
});

export const seedResources = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  inputResources: ResourceSeeder[];
}) => {
  const outputItems: Record<string, SeedingResource> = {};

  for (const inputItem of params.inputResources) {
    const resourceToStore = fillResource(inputItem);
    outputItems[inputItem.id] = await setResourceId(
      resourceToStore,
      params.transaction,
      params.tenantId
    );
  }

  return outputItems;
};