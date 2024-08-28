/**
 * In OSS:
 *
 * - Only one single user tenant (`default`) is available.
 * - Admin tenant and Admin Console share one endpoint (`ADMIN_ENDPOINT`).
 *
 * There's no need to parse tenant ID from the first path segment in OSS, and the segment should be a fixed value.
 *
 * If we use `/default`, the URL will look ugly; thus we keep the old fashion `/console`.
 */
export const ossConsolePath = '/console';
