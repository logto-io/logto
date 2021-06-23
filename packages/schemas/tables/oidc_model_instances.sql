create table oidc_model_instances (
  model_name varchar(64) not null,
  id varchar(128) not null,
  payload jsonb not null,
  expires_at bigint not null,
  consumed_at bigint,
  user_code varchar(128),
  uid varchar(128),
  grant_id varchar(128),
  primary key (model_name, id)
);

create index oidc_model_instances__model_name_user_code
on oidc_model_instances (
  model_name,
  user_code
);

create index oidc_model_instances__model_name_uid
on oidc_model_instances (
  model_name,
  uid
);

create index oidc_model_instances__model_name_grant_id
on oidc_model_instances (
  model_name,
  grant_id
);
