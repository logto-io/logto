import { defaultTenantId } from '@logto/schemas';

const isProduction = process.env.NODE_ENV === 'production';
export const adminTenantEndpoint =
  process.env.ADMIN_TENANT_ENDPOINT ??
  (isProduction ? window.location.origin : 'http://localhost:3002');
export const userTenantId = process.env.USER_TENANT_ID ?? defaultTenantId;
