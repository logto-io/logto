export const internalRolePrefix = '#internal:';

export const isInternalRole = (roleName: string) => roleName.startsWith(internalRolePrefix);
