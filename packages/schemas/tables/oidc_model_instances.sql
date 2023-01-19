create table oidc_model_instances (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  model_name varchar(64) not null,
  id varchar(128) not null,
  payload jsonb /* @use OidcModelInstancePayload */ not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  primary key (id)
);

create index oidc_model_instances__model_name_id
  on oidc_model_instances (tenant_id, model_name, id);

create index oidc_model_instances__model_name_payload_user_code
  on oidc_model_instances (
    tenant_id,
    model_name,
    (payload->>'userCode')
  );

create index oidc_model_instances__model_name_payload_uid
  on oidc_model_instances (
    tenant_id,
    model_name,
    (payload->>'uid')
  );

create index oidc_model_instances__model_name_payload_grant_id
  on oidc_model_instances (
    tenant_id,
    model_name,
    (payload->>'grantId')
  );
