/* eslint-disable eslint-comments/disable-enable-pair */

import { sql, type DatabaseTransactionConnection } from 'slonik';

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
    itemTypeName: 'Resource',
    whereClauses: [sql`indicator = ${appToSeed.indicator}`],
    tableName: 'resources',
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

const createResources = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  apiIndicator: string
): Promise<Record<string, SeedingResource & { id: string }>> => {
  const appsToCreate = { payments: fillPaymentsResource(apiIndicator) };
  const outputValues = {
    payments: await setResourceId(appsToCreate.payments, transaction, tenantId),
  };

  return outputValues;
};

type SeedingResource = {
  id?: string;
  name: string;
  indicator: string;
  is_default?: boolean;
  access_token_ttl?: number;
};

const fillPaymentsResource = (apiIndicator: string): SeedingResource => ({
  name: 'Life Events Payments API',
  indicator: apiIndicator,
  is_default: false,
  access_token_ttl: 3600,
});

export const seedResources = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  apiIndicator: string
) => createResources(transaction, tenantId, apiIndicator);
