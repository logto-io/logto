import { generateStandardId } from '@logto/shared/universal';

import { type CreateScope } from '../db-entries/index.js';

/**
 * Built-in fine-grained scopes for each tenant's local Logto Management API resource.
 *
 * Scopes follow Auth0-aligned `action:resource` naming (`read`, `create`, `update`, `delete`,
 * plus `verify:verification_codes`). They are stored alongside the legacy `all` scope on each
 * tenant-local Management API resource and are never granted by default to seeded roles.
 */
export enum ManagementApiScope {
  ReadUsers = 'read:users',
  CreateUsers = 'create:users',
  UpdateUsers = 'update:users',
  DeleteUsers = 'delete:users',
  ReadOrganizations = 'read:organizations',
  CreateOrganizations = 'create:organizations',
  UpdateOrganizations = 'update:organizations',
  DeleteOrganizations = 'delete:organizations',
  ReadOrganizationRoles = 'read:organization_roles',
  ReadOrganizationScopes = 'read:organization_scopes',
  ReadApplications = 'read:applications',
  ReadRoles = 'read:roles',
  ReadApiResources = 'read:api_resources',
  ReadSignInExperience = 'read:sign_in_experience',
  UpdateSignInExperience = 'update:sign_in_experience',
  ReadHooks = 'read:hooks',
  CreateHooks = 'create:hooks',
  UpdateHooks = 'update:hooks',
  DeleteHooks = 'delete:hooks',
  ReadConnectors = 'read:connectors',
  ReadTenantSettings = 'read:tenant_settings',
  ReadLogs = 'read:logs',
  ReadDashboard = 'read:dashboard',
  ReadOneTimeTokens = 'read:one_time_tokens',
  CreateOneTimeTokens = 'create:one_time_tokens',
  UpdateOneTimeTokens = 'update:one_time_tokens',
  DeleteOneTimeTokens = 'delete:one_time_tokens',
  CreateVerificationCodes = 'create:verification_codes',
  VerifyVerificationCodes = 'verify:verification_codes',
  CreateSubjectTokens = 'create:subject_tokens',
}

export type ManagementApiScopeDefinition = Readonly<{
  name: ManagementApiScope;
  description: string;
}>;

export const managementApiScopeDescriptions: Readonly<Record<ManagementApiScope, string>> =
  Object.freeze({
    [ManagementApiScope.ReadUsers]:
      'Read users, user profiles, identities, sessions, grants, and related read-only user metadata.',
    [ManagementApiScope.CreateUsers]: 'Create new users.',
    [ManagementApiScope.UpdateUsers]:
      'Update user profiles, identifiers, custom data, passwords, suspension state, and revoke sessions, grants, or trusted devices.',
    [ManagementApiScope.DeleteUsers]: 'Delete users.',
    [ManagementApiScope.ReadOrganizations]:
      'Read organizations, members, member roles, applications, JIT settings, and invitations.',
    [ManagementApiScope.CreateOrganizations]: 'Create new organizations.',
    [ManagementApiScope.UpdateOrganizations]:
      'Update organizations and manage organization user memberships.',
    [ManagementApiScope.DeleteOrganizations]: 'Delete organizations.',
    [ManagementApiScope.ReadOrganizationRoles]:
      'Read organization roles and their assigned organization and resource scopes.',
    [ManagementApiScope.ReadOrganizationScopes]: 'Read organization scopes.',
    [ManagementApiScope.ReadApplications]:
      'Read applications, SAML applications, consent settings, access control rules, and masked secret metadata.',
    [ManagementApiScope.ReadRoles]: 'Read global roles, role scopes, and assigned members.',
    [ManagementApiScope.ReadApiResources]: 'Read API resources and their scopes.',
    [ManagementApiScope.ReadSignInExperience]:
      'Read sign-in experience, account center, custom phrases, custom profile fields, and check passwords.',
    [ManagementApiScope.UpdateSignInExperience]:
      'Update sign-in experience, account center, custom UI assets, custom phrases, and custom profile fields.',
    [ManagementApiScope.ReadHooks]:
      'Read webhooks, recent delivery logs, and masked webhook configuration.',
    [ManagementApiScope.CreateHooks]: 'Create new webhooks.',
    [ManagementApiScope.UpdateHooks]:
      'Update webhooks, rotate signing keys, and trigger test hooks.',
    [ManagementApiScope.DeleteHooks]: 'Delete webhooks.',
    [ManagementApiScope.ReadConnectors]:
      'Read social, passwordless, email, SMS, and enterprise SSO connectors with masked secrets.',
    [ManagementApiScope.ReadTenantSettings]:
      'Read tenant settings including domains, email templates, OIDC configs, JWT customizers, actions, CAPTCHA, sentinel activities, and system info.',
    [ManagementApiScope.ReadLogs]: 'Read audit logs.',
    [ManagementApiScope.ReadDashboard]: 'Read dashboard user analytics.',
    [ManagementApiScope.ReadOneTimeTokens]: 'Read one-time tokens with masked token values.',
    [ManagementApiScope.CreateOneTimeTokens]: 'Create one-time tokens.',
    [ManagementApiScope.UpdateOneTimeTokens]: 'Update one-time token status.',
    [ManagementApiScope.DeleteOneTimeTokens]: 'Delete one-time tokens.',
    [ManagementApiScope.CreateVerificationCodes]: 'Request and send verification codes.',
    [ManagementApiScope.VerifyVerificationCodes]: 'Verify verification codes.',
    [ManagementApiScope.CreateSubjectTokens]: 'Create subject tokens for user impersonation.',
  });

/** Ordered immutable catalog of all built-in Phase 1 Management API scopes. */
export const managementApiScopeCatalog: readonly ManagementApiScopeDefinition[] = Object.freeze(
  Object.values(ManagementApiScope).map((name) =>
    Object.freeze({
      name,
      description: managementApiScopeDescriptions[name],
    })
  )
);

/** All 14 read-only (`read:*`) Management API scopes covering 100% of Management API GET endpoints. */
export const readonlyManagementApiScopes: readonly ManagementApiScope[] = Object.freeze([
  ManagementApiScope.ReadUsers,
  ManagementApiScope.ReadOrganizations,
  ManagementApiScope.ReadOrganizationRoles,
  ManagementApiScope.ReadOrganizationScopes,
  ManagementApiScope.ReadApplications,
  ManagementApiScope.ReadRoles,
  ManagementApiScope.ReadApiResources,
  ManagementApiScope.ReadSignInExperience,
  ManagementApiScope.ReadHooks,
  ManagementApiScope.ReadConnectors,
  ManagementApiScope.ReadTenantSettings,
  ManagementApiScope.ReadLogs,
  ManagementApiScope.ReadDashboard,
  ManagementApiScope.ReadOneTimeTokens,
]);

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
