/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
import { Applications } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { type ApplicationSeeder } from './ogcio-seeder.js';
import { createOrUpdateItem } from './queries.js';

type SeedingApplication = {
  id: string;
  name: string;
  secret: string;
  description: string;
  type: string;
  oidc_client_metadata: string;
  custom_client_metadata: string;
  protected_app_metadata?: string;
  is_third_party: boolean;
};

const createApplication = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  appToSeed: SeedingApplication
) =>
  createOrUpdateItem({
    transaction,
    tenantId,
    toInsert: appToSeed,
    toLogFieldName: 'name',
    whereClauses: [sql`tenant_id = ${tenantId}`, sql`id = ${appToSeed.id}`],
    tableName: Applications.table,
  });

const setApplicationId = async (
  element: SeedingApplication,
  transaction: DatabaseTransactionConnection,
  tenantId: string
) => {
  element = await createApplication(transaction, tenantId, element);
};

const createArrayString = (values: string | string[]): string => {
  const valuesString = (Array.isArray(values) ? values : [values])
    .filter((value) => value.length > 0)
    .map((uri) => `"${uri}"`)
    .join(',');

  if (valuesString.length === 0) {
    return '[]';
  }

  return `[${valuesString}]`;
};

const fillApplications = (
  inputApplications: ApplicationSeeder[]
): Record<string, SeedingApplication> => {
  const outputValues: Record<string, SeedingApplication> = {};
  for (const inputApp of inputApplications) {
    outputValues[inputApp.name] = {
      id: inputApp.id,
      name: inputApp.name,
      secret: inputApp.secret,
      description: inputApp.description,
      type: inputApp.type,
      oidc_client_metadata: `{"redirectUris": ${createArrayString(
        inputApp.redirect_uri
      )}, "postLogoutRedirectUris": ${createArrayString(inputApp.logout_redirect_uri)}}`,
      custom_client_metadata: `{"idTokenTtl": 3600, "corsAllowedOrigins": [], "rotateRefreshToken": true, "refreshTokenTtlInDays": 14, "alwaysIssueRefreshToken": ${
        inputApp.always_issue_refresh_token ?? false
      }}`,
      is_third_party: inputApp.is_third_party ?? false,
    };
  }

  return outputValues;
};

export const seedApplications = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  applications: ApplicationSeeder[];
}) => {
  const appsToCreate = fillApplications(params.applications);
  const queries: Array<Promise<void>> = [];
  for (const element of Object.values(appsToCreate)) {
    queries.push(setApplicationId(element, params.transaction, params.tenantId));
  }

  await Promise.all(queries);

  return appsToCreate;
};
