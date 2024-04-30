import { type AdminConsoleKey } from '@logto/phrases';
import { ApplicationUserConsentScopeType } from '@logto/schemas';

export const permissionTabs = Object.freeze({
  [ApplicationUserConsentScopeType.UserScopes]: {
    title: 'application_details.permissions.user_profile',
    key: ApplicationUserConsentScopeType.UserScopes,
  },
  [ApplicationUserConsentScopeType.ResourceScopes]: {
    title: 'application_details.permissions.api_resource',
    key: ApplicationUserConsentScopeType.ResourceScopes,
  },
  [ApplicationUserConsentScopeType.OrganizationResourceScopes]: {
    // TODO @xiaoyijun: update the title
    title: 'application_details.permissions.api_resource',
    key: ApplicationUserConsentScopeType.OrganizationResourceScopes,
  },
  [ApplicationUserConsentScopeType.OrganizationScopes]: {
    title: 'application_details.permissions.organization',
    key: ApplicationUserConsentScopeType.OrganizationScopes,
  },
}) satisfies {
  [key in ApplicationUserConsentScopeType]: {
    title: AdminConsoleKey;
    key: key;
  };
};
