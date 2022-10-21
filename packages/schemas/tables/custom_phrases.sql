create table custom_phrases (
  language_tag varchar(16) not null,
  translation jsonb /* @use Translation */ not null,
  primary key(language_tag)
);
