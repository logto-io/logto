create table settings (
    id varchar(21) not null,
    custom_domain text,
    admin_console jsonb /* @use AdminConsoleConfig */ not null,
    primary key (id)
);
