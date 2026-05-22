/* init_order = 2 */

/** The user role allow relations for application-level access control. */
create table application_access_control_user_role_relations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  role_id varchar(21) not null
    references roles (id) on update cascade on delete cascade,
  primary key (tenant_id, application_id, role_id),
  constraint application_access_control_user_role_relations__role_type
    check (public.check_role_type(role_id, 'User'))
);
