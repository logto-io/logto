import { defaultTenantId, ossConsolePath } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';

import { CloudRoute } from '@/cloud/types';

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

    // eslint-disable-next-line no-restricted-syntax
    if (Object.values(CloudRoute).includes(segment as CloudRoute)) {
      return '';
    }

    return segment ?? '';
  }

  return defaultTenantId;
};

export const getBasename = () => (isCloud ? '/' + getUserTenantId() : ossConsolePath);

export const getCallbackUrl = (tenantId?: string) =>
  new URL('/' + conditionalArray(tenantId, 'callback').join('/'), window.location.origin);

export const getSignOutRedirectPathname = () => (isCloud ? '/' : ossConsolePath);

export const maxFreeTenantNumbers = 3;
