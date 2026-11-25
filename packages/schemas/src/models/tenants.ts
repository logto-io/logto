import { createModel } from '@withtyped/server/model';
import type { InferModelType } from '@withtyped/server/model';
import { z } from 'zod';

import { TenantTag } from '../types/tenant.js';

export const Tenants = createModel(
  /* Sql */ `
  /* init_order = 0 */
  create table tenants (
    id varchar(64) not null,
    db_user varchar(128),
    db_user_password varchar(128),
    name varchar(128) not null default 'My Project',
    tag varchar(64) not null default '${TenantTag.Development}',
    created_at timestamptz not null default(now()),
    is_suspended boolean not null default false,
    primary key (id),
    constraint tenants__db_user
      unique (db_user)
  );
  /* The tenant lookup db_user = current_user compares under the "C" collation of the name type and only a "C" index serves it */
  create index tenants__db_user_collate_c
    on tenants ((db_user collate "C"));
  /* no_after_each */
`,
  'public'
)
  .extend('tag', z.nativeEnum(TenantTag))
  .extend('createdAt', { readonly: true });

export type TenantModel = InferModelType<typeof Tenants>;
