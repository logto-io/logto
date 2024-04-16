/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import type { CommonQueryMethods, DatabaseTransactionConnection } from '@silverhand/slonik';

import { seedApplications } from './applications.js';
import { getTenantSeederData, type OgcioSeeder } from './ogcio-seeder.js';
import { seedOrganizationRbacData } from './organizations-rbac.js';
import { createOrganizations } from './organizations.js';
import { seedResourceRbacData } from './resources-rbac.js';
import { seedResources } from './resources.js';

const createDataForTenant = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  tenantData: OgcioSeeder
) => {
  const organizations = await createOrganizations({
    transaction,
    tenantId,
    organizations: tenantData.organizations,
  });
  const organizationsRbac = await seedOrganizationRbacData({
    transaction,
    tenantId,
    toSeed: tenantData,
  });
  const applications = await seedApplications({
    transaction,
    tenantId,
    applications: tenantData.applications,
  });
  const resources = await seedResources({
    transaction,
    tenantId,
    inputResources: tenantData.resources,
  });
  const resourcesRbac = await seedResourceRbacData({
    tenantId,
    transaction,
    toSeed: tenantData,
    seededResources: resources,
  });
};

const transactionMethod = async (transaction: DatabaseTransactionConnection) => {
  const seedData = getTenantSeederData();
  const items: Array<Promise<void>> = [];
  for (const tenantId of Object.keys(seedData)) {
    items.push(createDataForTenant(transaction, tenantId, seedData[tenantId]!));
  }

  await Promise.all(items);

  // Const resourcesRbac = await seedResourceRbacData(transaction, defaultTenantId, resources);
};

export const seedOgcio = async (connection: CommonQueryMethods) => {
  await connection.transaction(transactionMethod);
};
