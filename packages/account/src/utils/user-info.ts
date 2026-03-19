import type { SignInIdentifier, UserProfileResponse } from '@logto/schemas';
import { SignInIdentifier as SignInIdentifierValue } from '@logto/schemas';

export const applyBoundIdentifierToUserInfo = (
  userInfo: Partial<UserProfileResponse> | undefined,
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone,
  identifier: string
): Partial<UserProfileResponse> | undefined => {
  if (!userInfo) {
    return userInfo;
  }

  return identifierType === SignInIdentifierValue.Email
    ? { ...userInfo, primaryEmail: identifier }
    : { ...userInfo, primaryPhone: identifier };
};
