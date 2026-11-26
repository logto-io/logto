import { generateStandardId } from '@logto/shared/universal';

import { type CreateScope } from '../db-entries/index.js';

/**
 * Built-in fine-grained scopes for each tenant's local Logto Management API resource.
 *
 * Scopes follow `action:resource` naming (`read`, `create`, `update`, `delete`,
 * plus `verify:verification_codes`) and are added incrementally by domain PRs alongside their
 * route bindings and credential masking. Once all Phase 1 domains are finalized, a single
 * backfill alteration and seed update will populate existing and new tenant-local resources.
 */
export const ManagementApiScope = Object.freeze({} as const);

// eslint-disable-next-line @typescript-eslint/no-redeclare -- companion const object and union type for incremental domain scope additions
export type ManagementApiScope = (typeof ManagementApiScope)[keyof typeof ManagementApiScope];

export type ManagementApiScopeDefinition = Readonly<{
  name: ManagementApiScope;
  description: string;
}>;

export const managementApiScopeDescriptions: Readonly<Record<ManagementApiScope, string>> =
  Object.freeze({});

const scopeValues: readonly ManagementApiScope[] =
  Object.values<ManagementApiScope>(ManagementApiScope);

/** Ordered immutable catalog of all built-in Management API scopes. */
export const managementApiScopeCatalog: readonly ManagementApiScopeDefinition[] = Object.freeze(
  scopeValues.map((name) =>
    Object.freeze({
      name,
      description: managementApiScopeDescriptions[name],
    })
  )
);

/** All read-only (`read:*`) Management API scopes. */
export const readonlyManagementApiScopes: readonly ManagementApiScope[] = Object.freeze(
  scopeValues.filter((name) => String(name).startsWith('read:'))
);

/**
 * Materialize the built-in Management API scope catalog as `CreateScope` rows for a tenant's
 * canonical local Management API resource.
 */
export const materializeManagementApiScopes = (
  tenantId: string,
  resourceId: string
): CreateScope[] =>
  managementApiScopeCatalog.map(({ name, description }) => ({
    tenantId,
    id: generateStandardId(),
    name,
    description,
    resourceId,
  }));
