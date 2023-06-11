import { createModel } from '@withtyped/server/model';
import type { InferModelType } from '@withtyped/server/model';
import { z } from 'zod';

export enum TenantTag {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export const Tenants = createModel(/* sql */ `
  /* init_order = 0 */
  create table tenants (
    id varchar(21) not null,
    db_user varchar(128),
    db_user_password varchar(128),
    name varchar(128) not null default 'My Project',
    tag varchar(64) not null default '${TenantTag.Development}',
    created_at timestamptz not null default(now()),
    primary key (id),
    constraint tenants__db_user
      unique (db_user)
  );
  /* no_after_each */
`)
  .extend('tag', z.nativeEnum(TenantTag))
  .extend('createdAt', { readonly: true });

export type TenantModel = InferModelType<typeof Tenants>;

export type TenantInfo = Pick<TenantModel, 'id' | 'name' | 'tag'> & { indicator: string };

export const tenantInfoGuard: z.ZodType<TenantInfo> = Tenants.guard('model')
  .pick({ id: true, name: true, tag: true })
  .extend({ indicator: z.string() });
