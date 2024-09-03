/* init_order = 2 */

/** Application level sign-in experience configuration. */
create table application_sign_in_experiences (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  color jsonb /* @use PartialColor */ not null default '{}'::jsonb,
  branding jsonb /* @use Branding */ not null default '{}'::jsonb,
  terms_of_use_url varchar(2048),
  privacy_policy_url varchar(2048),
  display_name varchar(256),
  primary key (tenant_id, application_id)
);
