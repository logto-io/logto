import { TenantScope } from '@logto/schemas';

/**
 * Whether the current user lacks write access to the current tenant. Cloud only: its Management
 * API proxy enforces the tenant scopes, and self-hosted has no counterpart. Unknown scopes (still
 * loading or failed to load) count as writable, so members who can write never see the read-only
 * state flash; the proxy refuses a read-only member's writes either way.
 */
export const getIsReadOnlyAccess = ({
  isDevFeaturesEnabled,
  isCloud,
  scopes,
}: {
  isDevFeaturesEnabled: boolean;
  isCloud: boolean;
  scopes: string[] | undefined;
}) =>
  isDevFeaturesEnabled &&
  isCloud &&
  scopes !== undefined &&
  !scopes.includes(TenantScope.WriteData);
