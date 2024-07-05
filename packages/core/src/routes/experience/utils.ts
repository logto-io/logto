import { InteractionIdentifierType, type InteractionIdentifier } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: InteractionIdentifier
) => {
  switch (type) {
    case InteractionIdentifierType.Username: {
      return userQuery.findUserByUsername(value);
    }
    case InteractionIdentifierType.Email: {
      return userQuery.findUserByEmail(value);
    }
    case InteractionIdentifierType.Phone: {
      return userQuery.findUserByPhone(value);
    }
  }
};
