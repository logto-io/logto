/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import { Hooks } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { type WebhookSeeder } from './ogcio-seeder.js';
import { createOrUpdateItemWithoutId } from './queries.js';

export type SeedingWebhook = {
  tenant_id: string;
  id: string;
  name: string;
  events: string;
  config: string;
  signing_key: string;
  enabled: boolean;
};

const createWebhook = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  webhookToSeed: SeedingWebhook
) =>
  createOrUpdateItemWithoutId({
    transaction,
    tenantId,
    toInsert: webhookToSeed,
    toLogFieldName: 'id',
    whereClauses: [sql`tenant_id = ${tenantId}`, sql`id = ${webhookToSeed.id}`],
    tableName: Hooks.table,
    columnToGet: 'id',
  });

const fillWebhooks = (inputHooks: WebhookSeeder[], tenantId: string): SeedingWebhook[] => {
  return inputHooks.map((hook) => ({
    tenant_id: tenantId,
    id: hook.id,
    name: hook.name,
    events: JSON.stringify(hook.events),
    config: JSON.stringify(hook.config),
    signing_key: hook.signing_key,
    enabled: hook.enabled,
  }));
};

export const seedWebhooks = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  hooks: WebhookSeeder[];
}) => {
  const hooksToCreate = fillWebhooks(params.hooks, params.tenantId);
  const queries: Array<Promise<SeedingWebhook>> = [];
  for (const element of hooksToCreate) {
    queries.push(createWebhook(params.transaction, params.tenantId, element));
  }

  await Promise.all(queries);
  return hooksToCreate;
};
