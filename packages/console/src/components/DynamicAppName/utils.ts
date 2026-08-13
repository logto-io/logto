import { trySafe } from '@silverhand/essentials';

/**
 * Resolve what a dynamic app (CIMD) row displays. A snapshot name wins; the backend falls
 * back to the identifier itself when the metadata document has no `client_name` (and an
 * empty string can come through as well), so both render the identifier host — the
 * permanent identity signal, matching the consent page. `isCimdClientId` only checks the
 * scheme prefix, so a malformed identifier renders as-is instead of crashing the row.
 */
export const getDynamicAppDisplayName = (clientId: string, name?: string) => {
  if (name && name !== clientId) {
    return name;
  }

  return trySafe(() => new URL(clientId).host) ?? clientId;
};
