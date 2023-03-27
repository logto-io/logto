import { defaultTenantId, ossConsolePath } from '@logto/schemas';

import { CloudRoute } from '@/cloud/types';

import { isCloud } from './cloud';

const getAdminTenantEndpoint = () => {
  // Allow endpoint override for dev or testing
  if (process.env.ADMIN_ENDPOINT) {
    return new URL(process.env.ADMIN_ENDPOINT);
  }

  return new URL(
    isCloud ? window.location.origin.replace('cloud.', 'auth.') : window.location.origin
  );
};

export const adminTenantEndpoint = getAdminTenantEndpoint();

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

export const getSignOutRedirectPathname = () => (isCloud ? '/' : ossConsolePath);
