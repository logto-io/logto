import {
  SignInIdentifier,
  type VerificationIdentifier,
  VerificationType,
  type InteractionIdentifier,
  type User,
  type VerificationCodeSignInIdentifier,
  AdditionalIdentifier,
} from '@logto/schemas';
import { cond, pick } from '@silverhand/essentials';

import type Queries from '#src/tenants/Queries.js';

import type { InteractionProfile, PublicInteractionStorageData } from '../types.js';

import type ExperienceInteraction from './experience-interaction.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: VerificationIdentifier
) => {
  switch (type) {
    case SignInIdentifier.Username: {
      return userQuery.findUserByUsername(value);
    }
    case SignInIdentifier.Email: {
      return userQuery.findUserByEmail(value);
    }
    case SignInIdentifier.Phone: {
      return userQuery.findUserByNormalizedPhone(value);
    }
    case AdditionalIdentifier.UserId: {
      return userQuery.findUserById(value);
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

export const sanitizeInteractionData = (
  experienceInteraction: ExperienceInteraction
): PublicInteractionStorageData => {
  const { interactionEvent, userId, profile, verificationRecords, captcha } =
    experienceInteraction.toJson();

  return {
    interactionEvent,
    userId,
    // Only include sanitized profile fields, excluding sensitive data like passwords and tokens
    profile: cond(
      profile &&
        pick(
          profile,
          'avatar',
          'name',
          'username',
          'primaryEmail',
          'primaryPhone',
          'profile',
          'customData',
          'socialIdentity',
          'enterpriseSsoIdentity',
          'jitOrganizationIds',
          'syncedEnterpriseSsoIdentity'
        )
    ),
    verificationRecords: verificationRecords?.map((record) => {
      return {
        id: record.id,
        type: record.type,
        ...cond('verified' in record && { verified: record.verified }),
        ...cond('identifier' in record && { identifier: record.identifier }),
        ...cond('userId' in record && { userId: record.userId }),
        ...cond('connectorId' in record && { connectorId: record.connectorId }),
        ...cond('templateType' in record && { templateType: record.templateType }),
        ...cond('socialUserInfo' in record && { socialUserInfo: record.socialUserInfo }),
        ...cond(
          'enterpriseSsoUserInfo' in record && {
            enterpriseSsoUserInfo: record.enterpriseSsoUserInfo,
          }
        ),
        ...cond(
          'oneTimeTokenContext' in record && {
            oneTimeTokenContext: record.oneTimeTokenContext,
          }
        ),
      };
    }),
    captcha,
  };
};
