import { createModel } from '@withtyped/server/model';
import type { InferModelType } from '@withtyped/server/model';
import { z } from 'zod';

import { TenantTag } from '../types/tenant.js';

export const Tenants = createModel(
  /* Sql */ `
  /* init_order = 0 */
  create table tenants (
    id varchar(21) not null,
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
  /* no_after_each */
`,
  'public'
)
  .extend('tag', z.nativeEnum(TenantTag))
  .extend('createdAt', { readonly: true });

export type TenantModel = InferModelType<typeof Tenants>;
