import {
  type DesensitizedSocialTokenSetSecret,
  type DesensitizedEnterpriseSsoTokenSetSecret,
} from '@logto/schemas';

import { TokenStatus } from '@/types/connector';

export const getTokenStatus = (
  isTokenStorageSupported?: boolean,
  tokenSecret?: DesensitizedSocialTokenSetSecret | DesensitizedEnterpriseSsoTokenSetSecret
): TokenStatus => {
  if (!isTokenStorageSupported) {
    return TokenStatus.NotApplicable;
  }

  if (!tokenSecret) {
    return TokenStatus.Inactive;
  }

  const {
    metadata: { expiresAt },
  } = tokenSecret;

  const isExpired = expiresAt && expiresAt < Math.ceil(Date.now() / 1000);

  if (isExpired) {
    return TokenStatus.Expired;
  }

  return TokenStatus.Active;
};
