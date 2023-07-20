import type { TenantInfo } from '@/types/tenant';

export type CreateTenantData = Pick<TenantInfo, 'name' | 'tag'>;
