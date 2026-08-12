/**
 * Third-party applications and the dynamic app (CIMD) share the consent permissions UI but not its
 * copy. Both phrase groups declare the same keys, so the group name is enough to switch between
 * them.
 */
export type PermissionsPhraseGroup =
  | 'application_details.permissions'
  | 'applications.dynamic_app.permissions';
