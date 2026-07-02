import { TenantSettingsTabs } from '.';

export const subscriptionPage = `/tenant-settings/${TenantSettingsTabs.Subscription}`;

/** The tenant settings landing route; redirects to the first available tab. Safe for all tenants (unlike {@link subscriptionPage}, which is not registered for dev tenants). */
export const tenantSettingsPage = '/tenant-settings';
