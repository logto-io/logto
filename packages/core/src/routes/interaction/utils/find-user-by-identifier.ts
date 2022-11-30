import { getLogtoConnectorById } from '#src/connectors/index.js';
import {
  findUserByEmail,
  findUserByUsername,
  findUserByPhone,
  findUserByIdentity,
} from '#src/queries/user.js';

import type { UserIdentity } from '../types/index.js';

export default async function findUserByIdentifier(identity: UserIdentity) {
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
