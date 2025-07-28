/* init_order = 2 */

/** The relations between organizations and users. It indicates membership of users in organizations. */
create table organization_user_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  primary key (tenant_id, organization_id, user_id),
  constraint organization_user_relations__user_id__fk
    foreign key (tenant_id, user_id)
      references users (tenant_id, id) on update cascade on delete cascade
);
