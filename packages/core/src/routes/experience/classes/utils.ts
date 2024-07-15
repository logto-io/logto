import { SignInIdentifier, type InteractionIdentifier } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: InteractionIdentifier
) => {
  switch (type) {
    case SignInIdentifier.Username: {
      return userQuery.findUserByUsername(value);
    }
    case SignInIdentifier.Email: {
      return userQuery.findUserByEmail(value);
    }
    case SignInIdentifier.Phone: {
      return userQuery.findUserByPhone(value);
    }
  }
};
