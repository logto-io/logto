/* This SQL will run after each query files except lifecycle scripts and files that explicitly exclude `after_each`. */

create trigger set_tenant_id before insert on ${name}
  for each row execute procedure set_tenant_id();

alter table ${name} enable row level security;

create policy ${name}_tenant_id on ${name}
  to logto_tenant_${database}
  using (tenant_id = (select id from tenants where db_user = current_user));
