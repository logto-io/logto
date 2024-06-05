/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import { LogtoConfigs, LogtoTenantConfigKey, SignInExperiences } from '@logto/schemas';
import {
  type QueryResult,
  type QueryResultRow,
  sql,
  type DatabaseTransactionConnection,
} from '@silverhand/slonik';

import { type SignInExperienceSeeder } from './ogcio-seeder.js';
import { getInsertedColumnValue, updateQuery } from './queries.js';

type SeedingExperience = {
  id: string;
  color: string;
  branding: string;
  language_info: string;
  sign_in: string;
  sign_up: string;
  social_sign_in_connector_targets: string;
  sign_in_mode: string;
  terms_of_use_url?: string;
  privacy_policy_url?: string;
  custom_css?: string;
  custom_content?: string;
  password_policy?: string;
  mfa?: string;
  single_sign_on_enabled?: boolean;
};

const createExperience = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string,
  experienceToSeed: SeedingExperience
) => {
  // Load the config for the default tenant
  const currentValue = await getInsertedColumnValue({
    transaction,
    tenantId,
    whereClauses: [sql`key = ${LogtoTenantConfigKey.AdminConsole}`, sql`tenant_id = ${tenantId}`],
    tableName: LogtoConfigs.table,
    columnToGet: 'value',
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const jsonValue: {
    organizationCreated: boolean;
    signInExperienceCustomized: boolean;
  } = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;

  // Update config to enable the sign in customization
  const updateQueryString = updateQuery(
    [
      sql`value = ${JSON.stringify({
        ...jsonValue,
        signInExperienceCustomized: true,
      })}`,
    ],
    [sql`key = ${LogtoTenantConfigKey.AdminConsole}`, sql`tenant_id = ${tenantId}`],
    LogtoConfigs.table
  );

  await transaction.query(updateQueryString);

  // Update the default tenant's sign in customization config
  const toSetValues = Object.entries(experienceToSeed).map(([key, value]) => {
    return sql`${sql.identifier([key])} = ${value}`;
  });
  const whereClauses = [sql`tenant_id = ${tenantId}`, sql`id = ${experienceToSeed.id}`];

  const updateExperiencesQuery = updateQuery(toSetValues, whereClauses, SignInExperiences.table);
  return transaction.query(updateExperiencesQuery);
};

const fillExperiences = (inputExperiences: SignInExperienceSeeder[]): SeedingExperience[] => {
  return inputExperiences.map((experience) => ({
    id: experience.id,
    color: JSON.stringify(experience.color),
    branding: JSON.stringify(experience.branding),
    language_info: JSON.stringify(experience.language_info),
    sign_in: JSON.stringify(experience.sign_in),
    sign_up: JSON.stringify(experience.sign_up),
    social_sign_in_connector_targets: JSON.stringify(experience.social_sign_in_connector_targets),
    sign_in_mode: experience.sign_in_mode,
  }));
};

export const seedSignInExperiences = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  experiences: SignInExperienceSeeder[];
}) => {
  const experiencesToCreate = fillExperiences(params.experiences);
  const queries: Array<Promise<QueryResult<QueryResultRow>>> = [];
  for (const element of experiencesToCreate) {
    queries.push(createExperience(params.transaction, params.tenantId, element));
  }

  await Promise.all(queries);
  return experiencesToCreate;
};
