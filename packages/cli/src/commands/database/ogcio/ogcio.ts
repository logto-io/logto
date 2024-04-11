/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @silverhand/fp/no-let */

import { defaultTenantId } from '@logto/schemas';
import type { CommonQueryMethods, DatabaseTransactionConnection } from '@silverhand/slonik';

import { seedApplications } from './applications.js';
import { type OgcioParams } from './index.js';
import { seedOrganizationRbacData } from './organizations-rbac.js';
import { createOrganization } from './organizations.js';
import { seedResourceRbacData } from './resources-rbac.js';
import { seedResources } from './resources.js';

let inputOgcioParams: OgcioParams = {
  apiIndicator: '',
  appLogoutRedirectUri: '',
  appRedirectUri: '',
};

const transactionMethod = async (transaction: DatabaseTransactionConnection) => {
  const organizationId = await createOrganization(transaction, defaultTenantId);
  const organizationRbac = await seedOrganizationRbacData(transaction, defaultTenantId);
  const applications = await seedApplications(transaction, defaultTenantId, {
    appRedirectUri: inputOgcioParams.appRedirectUri,
    appLogoutRedirectUri: inputOgcioParams.appLogoutRedirectUri,
  });
  const resources = await seedResources(
    transaction,
    defaultTenantId,
    inputOgcioParams.apiIndicator
  );
  const resourcesRbac = await seedResourceRbacData(transaction, defaultTenantId, resources);
};

export const seedOgcio = async (connection: CommonQueryMethods, params: OgcioParams) => {
  inputOgcioParams = params;

  await connection.transaction(transactionMethod);
};
