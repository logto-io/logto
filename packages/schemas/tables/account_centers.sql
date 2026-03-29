create table account_centers (
  tenant_id varchar(21) not null
    references tenants (id) on update cascade on delete cascade,
  id varchar(21) not null,
  /** The whole feature can be disabled */
  enabled boolean not null default true,
  /** Control each fields */
  fields jsonb /* @use AccountCenterFieldControl */ not null default '{}'::jsonb,
  webauthn_related_origins jsonb /* @use WebauthnRelatedOrigins */ not null default '[]'::jsonb,
  /** URL for custom account deletion endpoint */
  delete_account_url varchar(2048),
  /** User-defined custom CSS for the account center */
  custom_css text,
  primary key (tenant_id, id)
);
