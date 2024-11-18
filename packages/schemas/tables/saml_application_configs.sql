/* init_order = 2 */

/**
 * The SAML application config and SAML-type application have a one-to-one correspondence:
 * - a SAML-type application can only have one SAML application config
 * - a SAML application config can only configure one SAML-type application
 */
create table saml_application_configs (
  application_id varchar(21) not null
    references applications (id) on update cascade on delete cascade,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  attribute_mapping jsonb /* @use SamlAttributeMapping */ not null default '{}'::jsonb,
  sp_metadata jsonb /* @use SamlSpMetadata */ not null,
  primary key (tenant_id, application_id),
  constraint application_type
    check (check_application_type(application_id, 'SAML'))
);
