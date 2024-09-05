/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import type { CommonQueryMethods, DatabaseTransactionConnection } from '@silverhand/slonik';

import { seedApplications } from './applications.js';
import { seedConnectors } from './connectors.js';
import { getTenantSeederData, type OgcioSeeder } from './ogcio-seeder.js';
import { seedOrganizationRbacData } from './organizations-rbac.js';
import { createOrganizations } from './organizations.js';
import { seedResourceRbacData } from './resources-rbac.js';
import { seedResources } from './resources.js';
import { seedSignInExperiences } from './sign-in-experiences.js';
import { seedUsers } from './users.js';
import { seedWebhooks } from './webhooks.js';

const createDataForTenant = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  tenantData: OgcioSeeder
) => {
  if (tenantData.organizations?.length) {
    const organizations = await createOrganizations({
      transaction,
      tenantId,
      organizations: tenantData.organizations,
    });
  }

  if (tenantData.applications?.length) {
    const applications = await seedApplications({
      transaction,
      tenantId,
      applications: tenantData.applications,
    });
  }

  await seedOrganizationRbacData({
    transaction,
    tenantId,
    toSeed: tenantData,
  });

  if (tenantData.resources?.length) {
    const resources = await seedResources({
      transaction,
      tenantId,
      inputResources: tenantData.resources,
    });

    await seedResourceRbacData({
      tenantId,
      transaction,
      toSeed: tenantData,
      seededResources: resources,
    });
  }

  if (tenantData.connectors?.length) {
    const connectors = await seedConnectors({
      transaction,
      tenantId,
      connectors: tenantData.connectors,
    });
  }

  if (tenantData.sign_in_experiences?.length) {
    const signInExperiences = await seedSignInExperiences({
      transaction,
      tenantId,
      experiences: tenantData.sign_in_experiences,
    });
  }

  if (tenantData.webhooks?.length) {
    const webhooks = await seedWebhooks({
      transaction,
      tenantId,
      hooks: tenantData.webhooks,
    });
  }

  if (tenantData.users?.length) {
    const users = await seedUsers({
      transaction,
      tenantId,
      usersToSeed: tenantData.users,
    });
  }
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
