import { TenantScope } from '@logto/schemas';

type AccessParams = {
  isCloud: boolean;
  scopes: string[] | undefined;
};

/**
 * Whether the current user lacks write access to the current tenant. Cloud only: its Management
 * API proxy enforces the tenant scopes, and self-hosted has no counterpart. Unknown scopes (still
 * loading or failed to load) count as writable, so members who can write never see the read-only
 * state flash; the proxy refuses a read-only member's writes either way.
 */
export const getIsReadOnlyAccess = ({ isCloud, scopes }: AccessParams) =>
  isCloud && scopes !== undefined && !scopes.includes(TenantScope.WriteData);

/**
 * Whether writes the Console makes without a member's action may run. Unlike
 * {@link getIsReadOnlyAccess}, unknown scopes (still loading or failed to load) count as not
 * writable, so these writes wait for the scopes and never run for a read-only member.
 */
export const getIsWriteAccessConfirmed = ({ isCloud, scopes }: AccessParams) =>
  !isCloud || Boolean(scopes?.includes(TenantScope.WriteData));
