/* init_order = 2 */

/** The direct user allow relations for application-level access control. */
create table application_access_control_user_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  user_id varchar(21) not null
    references users (id) on update cascade on delete cascade,
  primary key (tenant_id, application_id, user_id)
);
