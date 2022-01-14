create table resources (
    id varchar(24) not null,
    name text not null,
    identifier text not null unique, /* resource indicator also used as audience */
    access_token_ttl bigint not null default(86400), /* expiration value in seconds, default is 24h */
    primary key (id)
);