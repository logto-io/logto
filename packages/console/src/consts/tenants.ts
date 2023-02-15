import { defaultTenantId } from '@logto/schemas';

export const adminTenantEndpoint = process.env.ADMIN_TENANT_ENDPOINT ?? window.location.origin;
export const userTenantId = process.env.USER_TENANT_ID ?? defaultTenantId;
