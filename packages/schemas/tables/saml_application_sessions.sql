/* init_order = 2 */

create table saml_application_sessions (
  tenant_id varchar(21) not null 
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the session. */
  id varchar(32) not null,
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  /** The identifier of the SAML SSO auth request ID, SAML request ID is pretty long. */
  saml_request_id varchar(128),
  /** The identifier of the OIDC auth request state. */
  oidc_state varchar(32),
  /** When checking the OIDC auth state, we should have this flag to prevent replay attack. */
  is_oidc_state_checked boolean not null default false,
  /** When sending the SAML authn response, we should have this flag to prevent replay attack. */
  is_saml_response_sent boolean not null default false,
  /** The relay state of the SAML auth request. */
  relay_state varchar(256),
  /** The request info of the SAML auth request. */
  auth_request_info jsonb /* @use AuthRequestInfo */ not null,
  created_at timestamptz not null default(now()),
  expires_at timestamptz not null,
  primary key (tenant_id, id),
  constraint saml_application_sessions__application_type 
    check (check_application_type(application_id, 'SAML'))
);

create unique index saml_application_sessions__oidc_state 
  on saml_application_sessions (tenant_id, oidc_state);
create unique index saml_application_sessions__saml_request_id
  on saml_application_sessions (tenant_id, saml_request_id);
