import { createModel } from '@withtyped/server';

export const Tenants = createModel(/* sql */ `
  /* init_order = 0 */
  create table tenants (
    id varchar(21) not null,
    db_user varchar(128),
    db_user_password varchar(128),
    primary key (id),
    constraint tenants__db_user
      unique (db_user)
  );

  /* no_after_each */
`);
