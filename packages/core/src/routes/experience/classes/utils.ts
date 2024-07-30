import {
  SignInIdentifier,
  VerificationType,
  type InteractionIdentifier,
  type User,
  type VerificationCodeSignInIdentifier,
} from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

import type { InteractionProfile } from '../types.js';

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

/**
 * Convert the interaction profile `socialIdentity` to `User['identities']` data format
 */
export const toUserSocialIdentityData = (
  socialIdentity: Required<InteractionProfile>['socialIdentity']
): User['identities'] => {
  const { target, userInfo } = socialIdentity;

  return {
    [target]: {
      userId: userInfo.id,
      details: userInfo,
    },
  };
};

export const interactionIdentifierToUserProfile = (
  identifier: InteractionIdentifier
): { username: string } | { primaryEmail: string } | { primaryPhone: string } => {
  const { type, value } = identifier;
  switch (type) {
    case SignInIdentifier.Username: {
      return { username: value };
    }
    case SignInIdentifier.Email: {
      return { primaryEmail: value };
    }
    case SignInIdentifier.Phone: {
      return { primaryPhone: value };
    }
  }
};

export const codeVerificationIdentifierRecordTypeMap = Object.freeze({
  [SignInIdentifier.Email]: VerificationType.EmailVerificationCode,
  [SignInIdentifier.Phone]: VerificationType.PhoneVerificationCode,
}) satisfies Record<VerificationCodeSignInIdentifier, VerificationType>;
