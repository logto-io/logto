import { conditional } from '@silverhand/essentials';
import camelcaseKeys from 'camelcase-keys';

import assertThat from '#src/utils/assert-that.js';

import { SsoConnectorError, SsoConnectorErrorCodes } from '../types/error.js';
import { idTokenProfileStandardClaimsGuard } from '../types/oidc.js';
import { type SingleSignOnConnectorSession } from '../types/session.js';

export const mockGetUserInfo = (connectorSession: SingleSignOnConnectorSession, data: unknown) => {
  const result = idTokenProfileStandardClaimsGuard.safeParse(data);

  assertThat(
    result.success,
    new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
      message: 'Invalid user info',
    })
  );

  const { sub, name, picture, email, email_verified, phone, phone_verified, ...rest } = result.data;

  return {
    id: sub,
    ...conditional(name && { name }),
    ...conditional(picture && { avatar: picture }),
    ...conditional(email && email_verified && { email }),
    ...conditional(phone && phone_verified && { phone }),
    ...camelcaseKeys(rest),
  };
};
