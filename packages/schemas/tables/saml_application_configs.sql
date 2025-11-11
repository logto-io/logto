/* init_order = 2 */

/** The SAML application config and SAML-type application have a one-to-one correspondence: 1. a SAML-type application can only have one SAML application config. (CANNOT use "semicolon" in comments, since it indicates the end of query.) 2. a SAML application config can only configure one SAML-type application. */
create table saml_application_configs (
  application_id varchar(36) not null
    references applications (id) on update cascade on delete cascade,
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  attribute_mapping jsonb /* @use SamlAttributeMapping */ not null default '{}'::jsonb,
  entity_id varchar(128),
  acs_url jsonb /* @use SamlAcsUrl */,
  encryption jsonb /* @use SamlEncryption */,
  name_id_format varchar(128) /* @use NameIdFormat */ not null,
  primary key (tenant_id, application_id),
  constraint saml_application_configs__application_type
    check (check_application_type(application_id, 'SAML'))
);
