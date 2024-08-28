/* init_order = 1 */

/** Organizations defined by [RFC 0001](https://github.com/logto-io/rfcs/blob/HEAD/active/0001-organization.md). */
create table organizations (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The globally unique identifier of the organization. */
  id varchar(21) not null,
  /** The organization's name for display. */
  name varchar(128) not null,
  /** A brief description of the organization. */
  description varchar(256),
  /** Additional data associated with the organization. */
  custom_data jsonb /* @use JsonObject */ not null default '{}'::jsonb,
  /** Whether multi-factor authentication configuration is required for the members of the organization. */
  is_mfa_required boolean not null default false,
  /** When the organization was created. */
  created_at timestamptz not null default(now()),
  primary key (id)
);

create index organizations__id
  on organizations (tenant_id, id);
