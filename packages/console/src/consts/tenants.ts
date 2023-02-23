import { defaultTenantId, ossConsolePath } from '@logto/schemas';

import { isCloud } from './cloud';

const isProduction = process.env.NODE_ENV === 'production';

export const adminTenantEndpoint =
  process.env.ADMIN_ENDPOINT ?? (isProduction ? window.location.origin : 'http://localhost:3002');

export const getUserTenantId = () => {
  if (isCloud) {
    return window.location.pathname.split('/')[1] ?? '';
  }

  return defaultTenantId;
};

export const getBasename = () => (isCloud ? '/' + getUserTenantId() : ossConsolePath);
