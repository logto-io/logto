/* init_order = 1 */

/** 
 * Link that can be used to perform certain actions by verifying the token. The expiration time
 * of the link should be determined by the action it performs, thus there is no `expires_at`
 * column in this table.
 */
create table magic_links (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  /** The unique identifier of the link. */
  id varchar(21) not null,
  /** The token that can be used to verify the link. */
  token varchar(32) not null,
  /** The time when the link was created. */
  created_at timestamptz not null default (now()),
  /** The time when the link was consumed. */
  consumed_at timestamptz,
  primary key (id)
);

create index magic_links__token
  on magic_links (tenant_id, token);
