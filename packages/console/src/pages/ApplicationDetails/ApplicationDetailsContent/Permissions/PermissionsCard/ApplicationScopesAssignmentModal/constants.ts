import { ApplicationUserConsentScopeType } from '@logto/schemas';

import { type PermissionTabType } from './type';

export const allLevelPermissionTabs: PermissionTabType = Object.freeze({
  [ApplicationUserConsentScopeType.UserScopes]: {
    title: 'application_details.permissions.user_profile',
    key: ApplicationUserConsentScopeType.UserScopes,
  },
  [ApplicationUserConsentScopeType.ResourceScopes]: {
    title: 'application_details.permissions.api_permissions',
    key: ApplicationUserConsentScopeType.ResourceScopes,
  },
  [ApplicationUserConsentScopeType.OrganizationScopes]: {
    title: 'application_details.permissions.organization',
    key: ApplicationUserConsentScopeType.OrganizationScopes,
  },
});

export const userLevelPermissionsTabs: PermissionTabType = Object.freeze({
  [ApplicationUserConsentScopeType.UserScopes]: {
    title: 'application_details.permissions.user_profile',
    key: ApplicationUserConsentScopeType.UserScopes,
  },
  [ApplicationUserConsentScopeType.ResourceScopes]: {
    title: 'application_details.permissions.api_permissions',
    key: ApplicationUserConsentScopeType.ResourceScopes,
  },
});

export const organizationLevelPermissionsTab: PermissionTabType = Object.freeze({
  [ApplicationUserConsentScopeType.OrganizationScopes]: {
    title: 'application_details.permissions.organization',
    key: ApplicationUserConsentScopeType.OrganizationScopes,
  },
  [ApplicationUserConsentScopeType.OrganizationResourceScopes]: {
    title: 'application_details.permissions.api_permissions',
    key: ApplicationUserConsentScopeType.OrganizationResourceScopes,
  },
});
