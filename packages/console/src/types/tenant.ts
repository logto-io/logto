import { type TenantInfo as FullTenantInfo } from '@logto/schemas/models';

/**
 * We added an required `planId` field to the `TenantInfo` type, need to update the cloud
 * API to get this field, temporarily use this type to avoid type error.
 */
export type TenantInfo = Omit<FullTenantInfo, 'planId'> & { planId?: string };
