/* init_order = 2 */

/** The email domains that will be automatically provisioned for an organization. */
create table organization_email_domains (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The ID of the organization. */
  organization_id varchar(21) not null
    references organizations (id) on update cascade on delete cascade,
  /** The email domain that will be automatically provisioned. */
  email_domain varchar(128) not null,
  primary key (tenant_id, organization_id, email_domain)
);
