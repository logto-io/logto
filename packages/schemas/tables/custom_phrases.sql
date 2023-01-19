create table custom_phrases (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  language_tag varchar(16) not null,
  translation jsonb /* @use Translation */ not null,
  primary key (id),
  constraint custom_phrases__language_tag
    unique (tenant_id, language_tag)
);

create index custom_phrases__id
  on custom_phrases (tenant_id, id);
