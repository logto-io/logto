create table custom_phrases (
  language_key varchar(16) not null,
  translation jsonb /* @use Translation */ not null,
  primary key(language_key)
);
