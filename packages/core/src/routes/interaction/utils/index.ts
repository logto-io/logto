import type { SocialConnectorPayload, User, IdentifierPayload } from '@logto/schemas';

import type { PasscodeIdentifierPayload, PasswordIdentifierPayload } from '../types/index.js';

export const isPasswordIdentifier = (
  identifier: IdentifierPayload
): identifier is PasswordIdentifierPayload => 'password' in identifier;

export const isPasscodeIdentifier = (
  identifier: IdentifierPayload
): identifier is PasscodeIdentifierPayload => 'passcode' in identifier;

export const isSocialIdentifier = (
  identifier: IdentifierPayload
): identifier is SocialConnectorPayload =>
  'connectorId' in identifier && 'connectorData' in identifier;

// Social identities can take place the role of password
export const isUserPasswordSet = ({
  passwordEncrypted,
  identities,
}: Pick<User, 'passwordEncrypted' | 'identities'>): boolean => {
  return Boolean(passwordEncrypted) || Object.keys(identities).length > 0;
};
