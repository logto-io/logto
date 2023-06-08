import { z } from 'zod';

import { Tenants } from '../../models/tenants.js';
import { type TenantModel } from '../../seeds/tenant.js';

export { TenantTag } from './tag.js';

export const patchTenantGuard = Tenants.guard('patch').pick({ name: true, tag: true });
export type PatchTenant = z.infer<typeof patchTenantGuard>;

export const createTenantGuard = Tenants.guard('create');
export type CreateTenant = z.infer<typeof createTenantGuard>;

export type TenantInfo = Pick<TenantModel, 'id' | 'name' | 'tag'> & { indicator: string };

export const tenantInfoGuard: z.ZodType<TenantInfo> = Tenants.guard('model')
  .pick({ id: true, name: true, tag: true })
  .extend({ indicator: z.string() });
