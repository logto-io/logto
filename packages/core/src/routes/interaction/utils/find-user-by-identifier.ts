import type TenantContext from '#src/tenants/TenantContext.js';

import type { UserIdentity } from '../types/index.js';

/**
 * Find user by the given identifier in the following order:
 *
 * 1. Find user by username
 * 2. Find user by email
 * 3. Find user by phone
 * 4. Find user by social identity
 *
 * @returns The found user or `null` if no user is found.
 */
export default async function findUserByIdentifier(
  { queries, connectors }: TenantContext,
  identity: UserIdentity
) {
  const { findUserByEmail, findUserByUsername, findUserByPhone, findUserByIdentity } =
    queries.users;
  const { getLogtoConnectorById } = connectors;

  if ('username' in identity) {
    return findUserByUsername(identity.username);
  }

  if ('email' in identity) {
    return findUserByEmail(identity.email);
  }

  if ('phone' in identity) {
    return findUserByPhone(identity.phone);
  }

  if ('connectorId' in identity) {
    const {
      metadata: { target },
    } = await getLogtoConnectorById(identity.connectorId);

    return findUserByIdentity(target, identity.userInfo.id);
  }

  return null;
}
