/* init_order = 2 */

/** Application secrets for the `client_credentials` grant type and other confidential client use cases. Note that these secrets replace the `secret` column in the `applications` table, while the `secret` column is still used for the internal validation as `oidc-provider` does not support multiple secrets per client. */
create table application_secrets (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  /** The name of the secret. Should be unique within the application. */
  name varchar(256) not null,
  value varchar(64) not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (tenant_id, application_id, name),
  constraint application_type
    check (check_application_type(application_id, 'MachineToMachine', 'Traditional', 'Protected'))
);
