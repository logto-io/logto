/* init_order = 0.5 */

create function set_tenant_id() returns trigger as
$$ begin
  if new.tenant_id is not null then
    return new;
  end if;

  select tenants.id into new.tenant_id
    from tenants
    where tenants.db_user = current_user;

  return new;
end; $$ language plpgsql;

/* no_after_each */
