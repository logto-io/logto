import { defaultTenantId, ossConsolePath } from '@logto/schemas';

import { CloudRoute } from '@/cloud/types';

import { isCloud } from './cloud';

const isProduction = process.env.NODE_ENV === 'production';

export const adminTenantEndpoint =
  process.env.ADMIN_ENDPOINT ?? (isProduction ? window.location.origin : 'http://localhost:3002');

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
