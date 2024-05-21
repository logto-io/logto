/** @deprecated We don't restrict roles in the database anymore. */
export const internalRolePrefix = '#internal:';

/** @deprecated We don't restrict roles in the database anymore. */
export const isInternalRole = (roleName: string) => roleName.startsWith(internalRolePrefix);
