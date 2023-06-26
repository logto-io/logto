import { defaultTenantId, ossConsolePath } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';

import { adminEndpoint, isCloud } from './env';

const getAdminTenantEndpoint = () => {
  // Allow endpoint override for dev or testing
  if (adminEndpoint) {
    return new URL(adminEndpoint);
  }

  return new URL(
    isCloud ? window.location.origin.replace('cloud.', 'auth.') : window.location.origin
  );
};

export const adminTenantEndpoint = getAdminTenantEndpoint();

export const mainTitle = isCloud ? 'Logto Cloud' : 'Logto Console';

export const getUserTenantId = () => {
  if (isCloud) {
    const segment = window.location.pathname.split('/')[1];

    if (!segment || segment === 'callback' || segment.endsWith('-callback')) {
      return '';
    }

    return segment;
  }

  return defaultTenantId;
};

export const getBasename = () => (isCloud ? '/' + getUserTenantId() : ossConsolePath);

export const getCallbackUrl = (tenantId?: string) =>
  new URL(
    // Only Cloud has tenantId in callback URL
    '/' + conditionalArray(isCloud ? tenantId : 'console', 'callback').join('/'),
    window.location.origin
  );

export const getSignOutRedirectPathname = () => (isCloud ? '/' : ossConsolePath);

export const maxFreeTenantNumbers = 3;
