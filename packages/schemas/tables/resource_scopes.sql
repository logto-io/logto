create table resource_scopes (
    id varchar(24) not null,
    name varchar(64) not null,
    description text not null,
    resource_id varchar(24) not null,
    primary key (id),
    constraint fk_resource
        foreign key (resource_id)
            references resource_servers(id)
);

create unique index resource_scopes__resource_id_name
on resource_scopes (
    name,
    resource_id,
);