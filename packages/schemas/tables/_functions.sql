/* init_order = 0.5 */

/** A function to set the tenant_id column based on the current user. */
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

/** A function to set the `updated_at` column to the current time. */
create function set_updated_at() returns trigger as
$$ begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

/* no_after_each */
