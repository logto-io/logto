import {
  MfaFactor,
  userInfoSelectFields,
  type UserProfileResponse,
  type UserSsoIdentity,
  type User,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { parseE164PhoneNumberWithError, ParseError } from '@logto/shared/universal';
import { pick } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

export const transpileUserMfaVerifications = (
  mfaVerifications: User['mfaVerifications']
): UserMfaVerificationResponse => {
  return mfaVerifications.map((verification) => {
    const { id, createdAt, type } = verification;

    if (type === MfaFactor.BackupCode) {
      const { codes } = verification;

      return { id, createdAt, type, remainCodes: codes.filter((code) => !code.usedAt).length };
    }

    if (type === MfaFactor.WebAuthn) {
      const { agent } = verification;

      return { id, createdAt, type, agent };
    }

    return { id, createdAt, type };
  });
};

type ExtraUserInfo = {
  ssoIdentities?: UserSsoIdentity[];
};

/**
 * Transforms user data into a user profile response format
 *
 * This function is used when API endpoints return user profile information,
 * converting the internal user data model to an external user profile response format.
 *
 * Main purposes:
 *
 * 1. Selectively return user information fields
 * 2. Add additional user-related information (e.g., SSO identities)
 * 3. Handle password-related information
 *
 * @param user - Internal user data model
 * @param extraInfo - Additional user-related information, such as SSO identities
 * @returns Formatted user profile response object
 */
export const transpileUserProfileResponse = (
  user: User,
  extraInfo: ExtraUserInfo = {}
): UserProfileResponse => {
  const { ssoIdentities } = extraInfo;

  return {
    ...pick(user, ...userInfoSelectFields),
    hasPassword: Boolean(user.passwordEncrypted),
    ...(ssoIdentities && { ssoIdentities }),
  };
};

export const getValidPhoneNumber = (phone: string): string => {
  if (!phone) {
    return phone;
  }

  try {
    const phoneNumber = parseE164PhoneNumberWithError(phone);

    if (!phoneNumber.isValid()) {
      throw new RequestError({ code: 'user.invalid_phone', status: 422 });
    }

    const { number } = phoneNumber;
    if (typeof number !== 'string') {
      throw new RequestError({ code: 'user.invalid_phone', status: 422 });
    }
    return number.slice(1);
  } catch (error) {
    if (error instanceof ParseError) {
      throw new RequestError({ code: 'user.invalid_phone', status: 422 }, error);
    }
    throw error;
  }
};

export const validatePhoneNumber = (phone: string): void => {
  getValidPhoneNumber(phone);
};
