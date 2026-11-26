import { setTimeout as sleep } from 'node:timers/promises';

import { generateStandardId } from '@logto/shared/universal';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

const adminTenantId = 'admin';
const batchSize = 200;
const batchDelayMs = 50;

/**
 * Versioned snapshot of the 30 Phase 1 Management API scopes for this alteration.
 * Embedded inline so future catalog edits never mutate an already-released alteration.
 */
export const managementApiScopeSnapshot: ReadonlyArray<
  Readonly<{ name: string; description: string }>
> = Object.freeze([
  {
    name: 'read:users',
    description:
      'Read users, user profiles, identities, sessions, grants, and related read-only user metadata.',
  },
  { name: 'create:users', description: 'Create new users.' },
  {
    name: 'update:users',
    description:
      'Update user profiles, identifiers, custom data, passwords, suspension state, and revoke sessions, grants, or trusted devices.',
  },
  { name: 'delete:users', description: 'Delete users.' },
  {
    name: 'read:organizations',
    description:
      'Read organizations, members, member roles, applications, JIT settings, and invitations.',
  },
  { name: 'create:organizations', description: 'Create new organizations.' },
  {
    name: 'update:organizations',
    description: 'Update organizations and manage organization user memberships.',
  },
  { name: 'delete:organizations', description: 'Delete organizations.' },
  {
    name: 'read:organization_roles',
    description: 'Read organization roles and their assigned organization and resource scopes.',
  },
  { name: 'read:organization_scopes', description: 'Read organization scopes.' },
  {
    name: 'read:applications',
    description:
      'Read applications, SAML applications, consent settings, access control rules, and masked secret metadata.',
  },
  { name: 'read:roles', description: 'Read global roles, role scopes, and assigned members.' },
  { name: 'read:api_resources', description: 'Read API resources and their scopes.' },
  {
    name: 'read:sign_in_experience',
    description:
      'Read sign-in experience, account center, custom phrases, custom profile fields, and check passwords.',
  },
  {
    name: 'update:sign_in_experience',
    description:
      'Update sign-in experience, account center, custom UI assets, custom phrases, and custom profile fields.',
  },
  {
    name: 'read:hooks',
    description: 'Read webhooks, recent delivery logs, and masked webhook configuration.',
  },
  { name: 'create:hooks', description: 'Create new webhooks.' },
  {
    name: 'update:hooks',
    description: 'Update webhooks, rotate signing keys, and trigger test hooks.',
  },
  { name: 'delete:hooks', description: 'Delete webhooks.' },
  {
    name: 'read:connectors',
    description:
      'Read social, passwordless, email, SMS, and enterprise SSO connectors with masked secrets.',
  },
  {
    name: 'read:tenant_settings',
    description:
      'Read tenant settings including domains, email templates, OIDC configs, JWT customizers, actions, CAPTCHA, sentinel activities, and system info.',
  },
  { name: 'read:logs', description: 'Read audit logs.' },
  { name: 'read:dashboard', description: 'Read dashboard user analytics.' },
  { name: 'read:one_time_tokens', description: 'Read one-time tokens with masked token values.' },
  { name: 'create:one_time_tokens', description: 'Create one-time tokens.' },
  { name: 'update:one_time_tokens', description: 'Update one-time token status.' },
  { name: 'delete:one_time_tokens', description: 'Delete one-time tokens.' },
  { name: 'create:verification_codes', description: 'Request and send verification codes.' },
  { name: 'verify:verification_codes', description: 'Verify verification codes.' },
  {
    name: 'create:subject_tokens',
    description: 'Create subject tokens for user impersonation.',
  },
]);

const scopeNames = managementApiScopeSnapshot.map(({ name }) => name);
const expectedScopeCount = managementApiScopeSnapshot.length;

type TenantResourceRow = {
  tenantId: string;
  resourceId: string;
};

type ExistingScopeRow = {
  tenantId: string;
  resourceId: string;
  name: string;
};

const buildMissingScopeRows = (
  resources: readonly TenantResourceRow[],
  existingScopes: readonly ExistingScopeRow[]
): Array<[string, string, string, string, string]> => {
  const existingKeys = new Set(
    existingScopes.map(({ tenantId, resourceId, name }) => `${tenantId}:${resourceId}:${name}`)
  );

  return resources.flatMap(({ tenantId, resourceId }) =>
    managementApiScopeSnapshot
      .filter(({ name }) => !existingKeys.has(`${tenantId}:${resourceId}:${name}`))
      .map(({ name, description }): [string, string, string, string, string] => [
        tenantId,
        generateStandardId(),
        resourceId,
        name,
        description,
      ])
  );
};

/**
 * Inserts missing Phase 1 Management API scopes for every eligible tenant (`tenants.id != 'admin'`)
 * under its canonical local Management API resource (`https://<tenant_id>.logto.app/api`).
 *
 * Walks `tenants` by indexed primary key `id` in bounded batches and inserts only missing rows
 * using `ON CONFLICT (tenant_id, resource_id, name) DO NOTHING`, so reruns are cheap and preserve
 * existing IDs, descriptions, assignments, and `all` grants.
 */
export const backfillManagementApiScopes = async (connection: CommonQueryMethods) => {
  /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation -- keyset cursor and running totals */
  let lastTenantId = '';
  let insertedCount = 0;

  for (;;) {
    // eslint-disable-next-line no-await-in-loop -- each batch resumes after the previous batch's last tenant id
    const tenantBatch = await connection.any<{ id: string }>(sql`
      select id from tenants
      where id > ${lastTenantId}
        and id != ${adminTenantId}
      order by id
      limit ${batchSize}
    `);

    if (tenantBatch.length === 0) {
      break;
    }

    const batchTenantIds = tenantBatch.map(({ id }) => id);
    const nextCursor = batchTenantIds.at(-1);

    // eslint-disable-next-line no-await-in-loop -- bounded batch query
    const resources = await connection.any<TenantResourceRow>(sql`
      select
        tenant_id as "tenantId",
        id as "resourceId"
      from resources
      where tenant_id = any(${sql.array(batchTenantIds, 'varchar')})
        and indicator = 'https://' || tenant_id || '.logto.app/api'
    `);

    if (resources.length > 0) {
      const resourceIds = resources.map(({ resourceId }) => resourceId);

      // eslint-disable-next-line no-await-in-loop -- bounded batch query
      const existingScopes = await connection.any<ExistingScopeRow>(sql`
        select
          tenant_id as "tenantId",
          resource_id as "resourceId",
          name
        from scopes
        where resource_id = any(${sql.array(resourceIds, 'varchar')})
          and name = any(${sql.array(scopeNames, 'varchar')})
      `);

      const rowsToInsert = buildMissingScopeRows(resources, existingScopes);

      if (rowsToInsert.length > 0) {
        // eslint-disable-next-line no-await-in-loop -- bounded batch insert
        const { rowCount } = await connection.query(sql`
          insert into scopes (tenant_id, id, resource_id, name, description)
          select * from ${sql.unnest(rowsToInsert, [
            'varchar',
            'varchar',
            'varchar',
            'varchar',
            'text',
          ])}
          on conflict (tenant_id, resource_id, name) do nothing
        `);

        insertedCount += rowCount;

        // eslint-disable-next-line no-await-in-loop -- pause after writes to spare live traffic
        await sleep(batchDelayMs);
      }
    }

    if (!nextCursor || tenantBatch.length < batchSize) {
      break;
    }

    lastTenantId = nextCursor;
  }
  /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation */

  console.log(`Backfilled ${insertedCount} Management API scope rows.`);
};

type VerificationSummary = {
  missingResourceTenants: number;
  incompleteScopeTenants: number;
};

/**
 * Verifies inside the alteration transaction that every eligible tenant (`id != 'admin'`) has its
 * canonical local Management API resource and all 30 catalog scopes.
 *
 * @throws If any eligible tenant is missing its local Management API resource or any catalog scope.
 */
export const verifyManagementApiScopes = async (connection: CommonQueryMethods) => {
  const { missingResourceTenants, incompleteScopeTenants } =
    await connection.one<VerificationSummary>(sql`
      with eligible_tenants as (
        select id as tenant_id
        from tenants
        where id != ${adminTenantId}
      ),
      tenant_resources as (
        select
          et.tenant_id,
          r.id as resource_id
        from eligible_tenants as et
        left join resources as r
          on r.tenant_id = et.tenant_id
          and r.indicator = 'https://' || et.tenant_id || '.logto.app/api'
      ),
      scope_counts as (
        select
          tr.tenant_id,
          tr.resource_id,
          count(s.id) as scope_count
        from tenant_resources as tr
        left join scopes as s
          on s.tenant_id = tr.tenant_id
          and s.resource_id = tr.resource_id
          and s.name = any(${sql.array(scopeNames, 'varchar')})
        group by tr.tenant_id, tr.resource_id
      )
      select
        count(*) filter (where resource_id is null)::int as "missingResourceTenants",
        count(*) filter (
          where resource_id is not null and scope_count < ${expectedScopeCount}
        )::int as "incompleteScopeTenants"
      from scope_counts
    `);

  if (missingResourceTenants > 0 || incompleteScopeTenants > 0) {
    throw new Error(
      `Management API scope backfill verification failed: ${missingResourceTenants} tenant(s) missing local Management API resource, ${incompleteScopeTenants} tenant(s) missing catalog scopes.`
    );
  }
};

/** Removes the 30 snapshot catalog scopes from eligible tenants' local Management API resources. */
export const revertManagementApiScopes = async (connection: CommonQueryMethods) => {
  await connection.query(sql`
    delete from scopes
    where tenant_id != ${adminTenantId}
      and name = any(${sql.array(scopeNames, 'varchar')})
      and exists (
        select 1 from resources
        where resources.id = scopes.resource_id
          and resources.tenant_id = scopes.tenant_id
          and resources.indicator = 'https://' || scopes.tenant_id || '.logto.app/api'
      )
  `);
};
