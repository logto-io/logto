import { type TenantInfo } from '@logto/schemas/models';

export type CreateTenantData = Pick<TenantInfo, 'name' | 'tag'>;
