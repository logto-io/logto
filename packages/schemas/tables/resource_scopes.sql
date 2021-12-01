create table resource_scopes (
    id varchar(24) not null,
    name varchar(64) not null,
    description text not null,
    resource_id varchar(24) not null,
    primary key (id),
    constraint fk_resource
        foreign key (resource_id)
            references resources(id)
);

create unique index resource_scopes__resource_id_name
on resource_scopes (
    resource_id,
    name,
);