import { z } from 'zod';

import { type TenantModel } from '../seeds/tenant.js';

export enum TenantTag {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export type PatchTenant = Partial<Pick<TenantModel, 'name' | 'tag'>>;
export type CreateTenant = Pick<TenantModel, 'id' | 'dbUser' | 'dbUserPassword'> &
  PatchTenant & { createdAt?: number };

export const createTenantGuard = z.object({
  id: z.string(),
  dbUser: z.string(),
  dbUserPassword: z.string(),
  name: z.string().optional(),
  tag: z.nativeEnum(TenantTag).optional(),
  createdAt: z.number().optional(),
});

export type TenantInfo = Pick<TenantModel, 'id' | 'name' | 'tag'> & { indicator: string };

export const tenantInfoGuard: z.ZodType<TenantInfo> = createTenantGuard
  .pick({ id: true, name: true, tag: true })
  .extend({ indicator: z.string() })
  .required();
