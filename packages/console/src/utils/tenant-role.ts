import { type TenantRole } from '@logto/schemas';

import { type CloudTenantRole } from '@/cloud/types/router';

/**
 * Type a tenant role as the `roleName` of a Logto Cloud invitation or member role route.
 *
 * `@logto/cloud` types that `roleName` with its own copy of `TenantRole`, bundled from the
 * `@logto/schemas` its release was built with. When `TenantRole` has a role the copy lacks,
 * TypeScript refuses every `TenantRole` value there, not only that role. The roles both declare
 * have the same values, and Cloud validates the role at runtime, so the cast bridges only the two
 * declarations.
 *
 * Remove this helper and `CloudTenantRole`, and pass the role directly, once the installed
 * `@logto/cloud` is built from a `@logto/schemas` that has every role of `TenantRole`.
 */
export const toCloudTenantRole = (role: TenantRole): CloudTenantRole =>
  // eslint-disable-next-line no-restricted-syntax -- shared roles keep their values; Cloud validates the role
  role as CloudTenantRole;
