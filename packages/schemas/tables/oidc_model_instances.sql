create table oidc_model_instances (
  model_name varchar(64) not null,
  id varchar(128) not null,
  payload jsonb /* @use OidcModelInstancePayload */ not null,
  expires_at bigint not null,
  consumed_at bigint,
  primary key (model_name, id)
);

create index oidc_model_instances__model_name_payload_user_code
on oidc_model_instances (
  model_name,
  (payload->>'userCode')
);

create index oidc_model_instances__model_name_payload_uid
on oidc_model_instances (
  model_name,
  (payload->>'uid')
);

create index oidc_model_instances__model_name_payload_grant_id
on oidc_model_instances (
  model_name,
  (payload->>'grantId')
);
