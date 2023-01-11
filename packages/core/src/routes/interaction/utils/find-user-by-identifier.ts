import type TenantContext from '#src/tenants/TenantContext.js';

import type { UserIdentity } from '../types/index.js';

export default async function findUserByIdentifier(
  { queries, libraries }: TenantContext,
  identity: UserIdentity
) {
  const { findUserByEmail, findUserByUsername, findUserByPhone, findUserByIdentity } =
    queries.users;
  const { getLogtoConnectorById } = libraries.connectors;

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
