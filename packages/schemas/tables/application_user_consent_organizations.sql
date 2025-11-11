/* init_order = 3 */

/** The relations between applications, users and organizations. A relation means that a user has consented to an application to access data in an organization. */
create table application_user_consent_organizations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(36) not null
    references applications (id) on update cascade on delete cascade,
  organization_id ${id_format} not null,
  user_id ${id_format} not null,
  primary key (tenant_id, application_id, organization_id, user_id),
  /** User's consent to an application should be synchronized with the user's membership in the organization. */
  foreign key (tenant_id, organization_id, user_id)
    references organization_user_relations (tenant_id, organization_id, user_id)
    on update cascade on delete cascade
)
