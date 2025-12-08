/* init_order = 2 */

create table saml_application_sessions (
  tenant_id varchar(21) not null 
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the session. */
  id varchar(32) not null,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  /** The identifier of the SAML SSO auth request ID, SAML request ID is pretty long. */
  saml_request_id varchar(128) not null,
  /** The identifier of the OIDC auth request state. */
  oidc_state varchar(32),
  /** The relay state of the SAML auth request. */
  relay_state varchar(512),
  /** The raw request of the SAML auth request. */
  raw_auth_request text not null,
  created_at timestamptz not null default(now()),
  expires_at timestamptz not null,
  primary key (tenant_id, id),
  constraint saml_application_sessions__application_type 
    check (check_application_type(application_id, 'SAML'))
);
