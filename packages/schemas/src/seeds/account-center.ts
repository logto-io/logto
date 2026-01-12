import type { CreateAccountCenter } from '../db-entries/index.js';
import { AccountCenterControlValue } from '../foundations/index.js';

export const createDefaultAccountCenter = (forTenantId: string): Readonly<CreateAccountCenter> =>
  Object.freeze({
    tenantId: forTenantId,
    id: 'default',
    enabled: false,
    fields: {},
  });

/**
 * Create the account center for the admin tenant.
 * The account center is enabled by default and allows editing all fields,
 * so that the console profile page can use the Account API.
 */
export const createAdminTenantAccountCenter = (
  forTenantId: string
): Readonly<CreateAccountCenter> =>
  Object.freeze({
    tenantId: forTenantId,
    id: 'default',
    enabled: true,
    fields: {
      name: AccountCenterControlValue.Edit,
      avatar: AccountCenterControlValue.Edit,
      profile: AccountCenterControlValue.Edit,
      email: AccountCenterControlValue.Edit,
      phone: AccountCenterControlValue.Edit,
      password: AccountCenterControlValue.Edit,
      username: AccountCenterControlValue.Edit,
      social: AccountCenterControlValue.Edit,
      customData: AccountCenterControlValue.Edit,
      mfa: AccountCenterControlValue.Edit,
    },
  });
