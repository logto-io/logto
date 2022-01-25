create table sign_in_methods (
  id varchar(128) not null,
  name varchar(128) not null,
  connector_id varchar(128),
  metadata jsonb /* @use SignInMethodMetadata */,
  primary key (id),
  constraint fk_connector
    foreign key (connector_id)
    references connectors(id)
    on delete cascade
)
