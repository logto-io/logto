create type sign_algorithm_type as enum ('RS256');
create type access_token_format_type as enum ('jwt');

create table resource_servers (
    id varchar(24) not null,
    name text not null,
    identifier text not null unique, /* resource indicator also used as audience */
    access_token_ttl bigint not null default(86400), /* expiration value in seconds, default is 24h */
    access_token_format access_token_format_type not null default('jwt'),
    sign_algorithm sign_algorithm_type not null default('RS256'),
    primary key (id)
);