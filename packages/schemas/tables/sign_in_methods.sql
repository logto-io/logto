create table sign_in_methods (
  id varchar(128) not null,
  name varchar(128) not null,
  connector_id varchar(128),
  primary key (id),
  constraint fk__sign_in_methods__connector_id
    foreign key (connector_id)
    references connectors(id)
    on delete cascade
)
